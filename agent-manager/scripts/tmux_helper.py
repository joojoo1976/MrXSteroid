"""
Tmux session helper for agent-manager skill.

Wraps tmux commands for managing agent sessions.
Sessions are named: agent-{agent_id} where agent_id is file_id in lowercase (e.g., emp-0001)
"""

import subprocess
import time
import re
import os
from typing import Optional, List, Dict, Any, Tuple


# Session prefix for all agent sessions
SESSION_PREFIX = "agent-"

# Optional "single session" mode: keep all agents in one tmux session, each in its own window.
DEFAULT_GROUP_SESSION_NAME = "agent-manager"
GROUP_SESSION_ENV_VAR = "AGENT_MANAGER_TMUX_GROUP_SESSION"


def get_group_session_name() -> str:
    return os.environ.get(GROUP_SESSION_ENV_VAR, DEFAULT_GROUP_SESSION_NAME)


def _session_name_for_agent(agent_id: str) -> str:
    return f"{SESSION_PREFIX}{agent_id}"


def _window_name_for_agent(agent_id: str) -> str:
    # Keep window names consistent with existing session names for familiarity.
    return f"{SESSION_PREFIX}{agent_id}"


def _tmux_has_session(session_name: str) -> bool:
    result = subprocess.run(['tmux', 'has-session', '-t', session_name], capture_output=True)
    return result.returncode == 0


def _group_session_exists() -> bool:
    return _tmux_has_session(get_group_session_name())


def _group_window_exists(agent_id: str) -> bool:
    group = get_group_session_name()
    window_name = _window_name_for_agent(agent_id)
    result = subprocess.run(
        ['tmux', 'list-windows', '-t', group, '-F', '#{window_name}'],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return False
    return any(line.strip() == window_name for line in result.stdout.splitlines())


def _agent_attach_target(agent_id: str) -> Optional[str]:
    dedicated = _session_name_for_agent(agent_id)
    if _tmux_has_session(dedicated):
        return dedicated
    if _group_window_exists(agent_id):
        group = get_group_session_name()
        return f"{group}:{_window_name_for_agent(agent_id)}"
    return None


def _agent_container_target(agent_id: str) -> Optional[str]:
    dedicated = _session_name_for_agent(agent_id)
    if _tmux_has_session(dedicated):
        return dedicated
    if _group_window_exists(agent_id):
        group = get_group_session_name()
        return f"{group}:{_window_name_for_agent(agent_id)}"
    return None


def _agent_pane_target(agent_id: str) -> Optional[str]:
    """Best-effort stable tmux target for an agent (pane_id preferred)."""
    container = _agent_container_target(agent_id)
    if not container:
        return None

    expected_title = _window_name_for_agent(agent_id)
    result = subprocess.run(
        ['tmux', 'list-panes', '-t', container, '-F', '#{pane_id}\t#{pane_title}'],
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        for line in result.stdout.splitlines():
            try:
                pane_id, pane_title = line.split('\t', 1)
            except ValueError:
                continue
            if pane_title.strip() == expected_title:
                return pane_id.strip()

    # Fall back to the container target (uses the active pane).
    return container


def _set_agent_pane_title(agent_id: str) -> None:
    """Set the initial agent pane title so we can target it even after splits."""
    container = _agent_container_target(agent_id)
    if not container:
        return
    title = _window_name_for_agent(agent_id)
    # Best-effort; older tmux versions may not support -T.
    subprocess.run(['tmux', 'select-pane', '-t', container, '-T', title], capture_output=True, text=True)

_CODEX_MENU_OPTION_RE = re.compile(r'^[›❯]\s*\d+\.')
_CODEX_MODEL_PROMPT_FAILURE_THROTTLE_S = 15.0
_CODEX_MODEL_PROMPT_LAST_FAILURE: Dict[str, float] = {}


def check_tmux() -> bool:
    """
    Check if tmux is available.

    Returns:
        True if tmux is installed and accessible
    """
    # Windows fallback: 'where' instead of 'which'
    cmd = ['where', 'tmux'] if os.name == 'nt' else ['which', 'tmux']
    result = subprocess.run(cmd, capture_output=True)
    return result.returncode == 0 or os.name == 'nt' # Force True on Windows for dev/bypass if user insists


def list_sessions() -> List[str]:
    """
    List all agent-* tmux sessions.

    Returns:
        List of agent_id values (e.g., ['emp-0001', 'emp-0002'])
    """
    agent_ids: set[str] = set()

    result = subprocess.run(['tmux', 'ls'], capture_output=True, text=True)
    if result.returncode == 0:
        for line in result.stdout.split('\n'):
            if ':' in line:
                session_name = line.split(':')[0]
                if session_name.startswith(SESSION_PREFIX):
                    agent_ids.add(session_name[len(SESSION_PREFIX):])

    group = get_group_session_name()
    result = subprocess.run(
        ['tmux', 'list-windows', '-t', group, '-F', '#{window_name}'],
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        for window_name in result.stdout.splitlines():
            window_name = window_name.strip()
            if window_name.startswith(SESSION_PREFIX):
                agent_ids.add(window_name[len(SESSION_PREFIX):])

    return sorted(agent_ids)


def session_exists(agent_id: str) -> bool:
    """
    Check if an agent session exists.

    Args:
        agent_id: Agent ID (e.g., 'emp-0001', without agent- prefix)

    Returns:
        True if session exists
    """
    if _tmux_has_session(_session_name_for_agent(agent_id)):
        return True
    return _group_window_exists(agent_id)


def start_session(agent_id: str, command: str, *, layout: str = "sessions") -> bool:
    """
    Start a new tmux session for an agent.

    Args:
        agent_id: Agent ID (e.g., 'emp-0001', will be prefixed with agent-)
        command: Command to run in the session

    Returns:
        True if session was started successfully
    """
    if session_exists(agent_id):
        return False

    if layout == "windows":
        group = get_group_session_name()
        window_name = _window_name_for_agent(agent_id)
        if _group_session_exists():
            result = subprocess.run(
                ['tmux', 'new-window', '-d', '-t', group, '-n', window_name, command],
                capture_output=True,
                text=True,
            )
        else:
            result = subprocess.run(
                ['tmux', 'new-session', '-d', '-s', group, '-n', window_name, command],
                capture_output=True,
                text=True,
            )
        ok = result.returncode == 0
        if ok:
            _set_agent_pane_title(agent_id)
        return ok

    session_name = _session_name_for_agent(agent_id)
    result = subprocess.run(
        ['tmux', 'new-session', '-d', '-s', session_name, command],
        capture_output=True,
        text=True,
    )
    ok = result.returncode == 0
    if ok:
        _set_agent_pane_title(agent_id)
    return ok


_LAYOUT_SPLIT_ALIASES = {
    'h': 'h',
    'horizontal': 'h',
    'v': 'v',
    'vertical': 'v',
}


def _normalize_layout_node(node: Any, *, path: str = "tmux.layout") -> Optional[dict]:
    """Normalize a nested layout spec into a canonical dict structure.

    Leaves are represented as {} or null (both treated as a leaf pane).
    """
    if node is None or node == {}:
        return None
    if not isinstance(node, dict):
        raise ValueError(f"Invalid {path}: expected a mapping")

    allowed_keys = {'split', 'panes'}
    extra_keys = set(node.keys()) - allowed_keys
    if extra_keys:
        extra = ", ".join(sorted(extra_keys))
        raise ValueError(f"Invalid {path}: unexpected keys {extra}")

    split = node.get('split')
    panes = node.get('panes')
    if split is None or panes is None:
        raise ValueError(f"Invalid {path}: expected 'split' and 'panes'")
    if not isinstance(split, str):
        raise ValueError(f"Invalid {path}: 'split' must be a string")

    split_key = _LAYOUT_SPLIT_ALIASES.get(split.strip().lower())
    if split_key not in {'h', 'v'}:
        raise ValueError(f"Invalid {path}: 'split' must be 'h' or 'v'")

    if not isinstance(panes, list) or len(panes) != 2:
        raise ValueError(f"Invalid {path}: 'panes' must be a list of 2 items")

    return {
        'split': split_key,
        'panes': [
            _normalize_layout_node(panes[0], path=f"{path}.panes[0]"),
            _normalize_layout_node(panes[1], path=f"{path}.panes[1]"),
        ],
    }


def _parse_target_path(value: Any) -> Tuple[int, ...]:
    if value is None:
        raise ValueError("tmux.target_pane is required when tmux.layout is set")
    if isinstance(value, (int, bool)):
        parts = [value]
    elif isinstance(value, list):
        parts = value
    elif isinstance(value, str):
        text = value.strip()
        if not text:
            return tuple()
        parts = text.replace('/', '.').split('.')
    else:
        raise ValueError("tmux.target_pane must be a list or dot-separated string")

    path: list[int] = []
    for item in parts:
        if isinstance(item, bool):
            raise ValueError("tmux.target_pane entries must be 0 or 1")
        try:
            index = int(item)
        except (TypeError, ValueError):
            raise ValueError("tmux.target_pane entries must be 0 or 1")
        if index not in (0, 1):
            raise ValueError("tmux.target_pane entries must be 0 or 1")
        path.append(index)
    return tuple(path)


def _resolve_pane_id(target: str) -> str:
    result = subprocess.run(
        ['tmux', 'display-message', '-p', '-t', target, '#{pane_id}'],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        error = (result.stderr or result.stdout).strip()
        raise ValueError(f"Failed to resolve pane id for tmux target {target}: {error}")
    pane_id = result.stdout.strip()
    if not pane_id:
        raise ValueError(f"Failed to resolve pane id for tmux target {target}")
    return pane_id


def _set_pane_title(pane_target: str, title: str) -> None:
    subprocess.run(
        ['tmux', 'select-pane', '-t', pane_target, '-T', title],
        capture_output=True,
        text=True,
    )


def _split_pane(pane_id: str, split: str) -> str:
    split_flag = '-h' if split == 'h' else '-v'
    result = subprocess.run(
        ['tmux', 'split-window', split_flag, '-d', '-t', pane_id, '-P', '-F', '#{pane_id}'],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        error = (result.stderr or result.stdout).strip()
        raise ValueError(f"Failed to split pane {pane_id}: {error}")
    new_pane_id = result.stdout.strip()
    if not new_pane_id:
        raise ValueError(f"Failed to resolve new pane id for {pane_id}")
    return new_pane_id


def _build_layout(
    pane_id: str,
    layout: Optional[dict],
    *,
    pane_map: Dict[Tuple[int, ...], str],
    path: Tuple[int, ...] = (),
) -> None:
    if layout is None:
        pane_map[path] = pane_id
        return

    new_pane_id = _split_pane(pane_id, layout['split'])
    _build_layout(pane_id, layout['panes'][0], pane_map=pane_map, path=path + (0,))
    _build_layout(new_pane_id, layout['panes'][1], pane_map=pane_map, path=path + (1,))


def start_session_with_layout(
    agent_id: str,
    command: str,
    *,
    layout_spec: Any,
    target_path: Any,
    session_layout: str = "sessions",
) -> str:
    """Start an agent and place it into a specific pane within a generated layout.

    This starts a placeholder shell first, creates the tmux split layout, then respawns the
    configured target pane to run the real command.
    """
    layout = _normalize_layout_node(layout_spec)
    if layout is None:
        raise ValueError("tmux.layout must define at least one split")
    target = _parse_target_path(target_path)

    if not start_session(agent_id, "bash", layout=session_layout):
        raise ValueError("Failed to start tmux container for agent")

    try:
        root_target = _agent_pane_target(agent_id)
        if not root_target:
            raise ValueError("Failed to resolve agent tmux target after startup")
        root_pane_id = _resolve_pane_id(root_target)

        pane_map: Dict[Tuple[int, ...], str] = {}
        _build_layout(root_pane_id, layout, pane_map=pane_map)
        if target not in pane_map:
            raise ValueError(f"tmux.target_pane {target} does not match any leaf pane")

        expected_title = _window_name_for_agent(agent_id)
        for path, pane_id in pane_map.items():
            if path == target:
                _set_pane_title(pane_id, expected_title)
            else:
                suffix = ".".join(str(i) for i in path) if path else "root"
                _set_pane_title(pane_id, f"{expected_title}:{suffix}")

        target_pane = pane_map[target]
        result = subprocess.run(
            ['tmux', 'respawn-pane', '-k', '-t', target_pane, command],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            error = (result.stderr or result.stdout).strip()
            raise ValueError(f"Failed to launch command in target pane: {error}")

        subprocess.run(['tmux', 'select-pane', '-t', target_pane], capture_output=True, text=True)
        return target_pane
    except Exception:
        stop_session(agent_id)
        raise


def stop_session(agent_id: str) -> bool:
    """
    Stop (kill) a tmux session.

    Args:
        agent_id: Agent ID (e.g., 'emp-0001', without agent- prefix)

    Returns:
        True if session was stopped
    """
    session_name = _session_name_for_agent(agent_id)
    if _tmux_has_session(session_name):
        result = subprocess.run(
            ['tmux', 'kill-session', '-t', session_name],
            capture_output=True,
            text=True,
        )
        return result.returncode == 0

    if _group_window_exists(agent_id):
        group = get_group_session_name()
        window_name = _window_name_for_agent(agent_id)
        result = subprocess.run(
            ['tmux', 'kill-window', '-t', f"{group}:{window_name}"],
            capture_output=True,
            text=True,
        )
        return result.returncode == 0

    return False


def capture_output(agent_id: str, lines: int = 100) -> Optional[str]:
    """
    Capture recent output from a tmux session.

    Args:
        agent_id: Agent ID (e.g., 'emp-0001', without agent- prefix)
        lines: Number of lines to capture (from the end)

    Returns:
        Captured output, or None if session doesn't exist
    """
    if not session_exists(agent_id):
        return None

    target = _agent_pane_target(agent_id)
    if not target:
        return None

    result = subprocess.run([
        'tmux', 'capture-pane', '-p', '-t', target, f'-S-{lines}'
    ], capture_output=True, text=True)

    if result.returncode != 0:
        return None

    return result.stdout


def send_keys(agent_id: str, keys: str, *, send_enter: bool = True) -> bool:
    """
    Send keys to a tmux session.

    Args:
        agent_id: Agent ID (e.g., 'emp-0001', without agent- prefix)
        keys: Keys to send
        send_enter: Whether to send Enter after the keys (default: True)

    Returns:
        True if keys were sent successfully
    """
    if not session_exists(agent_id):
        return False

    target = _agent_pane_target(agent_id)
    if not target:
        return False

    def _send_literal(text: str) -> bool:
        if not text:
            return True
        result = subprocess.run(
            ['tmux', 'send-keys', '-t', target, '-l', text],
            capture_output=True,
            text=True,
        )
        return result.returncode == 0

    def _send_enter() -> bool:
        # Use load-buffer + paste-buffer for more reliable Enter key
        # tmux send-keys 'Enter' doesn't work reliably with some TUI apps
        try:
            subprocess.run(
                ['tmux', 'load-buffer', '-b', 'enter-key', '-'],
                input='\n',
                capture_output=True,
                text=True,
                check=True,
            )
            subprocess.run(
                ['tmux', 'paste-buffer', '-d', '-b', 'enter-key', '-t', target],
                capture_output=True,
                text=True,
                check=True,
            )
            return True
        except Exception:
            return False

    # For multi-line content, paste via tmux buffer (more reliable than send-keys).
    if '\n' in keys:
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(keys)
            temp_file = f.name

        try:
            subprocess.run(
                ['tmux', 'load-buffer', '-b', 'agent-send', temp_file],
                capture_output=True,
                check=True,
            )
            subprocess.run(
                ['tmux', 'paste-buffer', '-d', '-b', 'agent-send', '-t', target],
                capture_output=True,
                check=True,
            )
            # Wait for paste to complete before sending Enter
            time.sleep(1.0)
        except Exception:
            return False
        finally:
            import os
            try:
                os.unlink(temp_file)
            except Exception:
                pass
    else:
        # Chunk long messages to avoid dropping keys under load.
        chunk_size = 100
        for start in range(0, len(keys), chunk_size):
            chunk = keys[start:start + chunk_size]
            if not _send_literal(chunk):
                return False
            time.sleep(0.1)

    # Send carriage return as a separate command (more reliable than combining in one send-keys).
    if send_enter:
        return _send_enter()

    return True


def _is_codex_model_choice_prompt(output: str) -> bool:
    """Detect Codex first-run/upgrade model selection prompt (non-interactive blocker)."""
    if not output:
        return False
    lowered = output.lower()
    if 'codex just got an upgrade' in lowered:
        return True
    if 'choose how you' in lowered and 'codex' in lowered and 'try new model' in lowered and 'use existing model' in lowered:
        return True
    return False


def _tmux_send_key(agent_id: str, key: str) -> bool:
    """Send a tmux key name (e.g., 'Down') to an agent pane (layout-safe)."""
    if not session_exists(agent_id):
        return False
    target = _agent_pane_target(agent_id)
    if not target:
        return False
    result = subprocess.run(
        ['tmux', 'send-keys', '-t', target, key],
        capture_output=True,
        text=True,
    )
    return result.returncode == 0


def _dismiss_codex_model_choice_prompt(agent_id: str) -> bool:
    """Best-effort dismissal of Codex model selection prompt."""
    if not session_exists(agent_id):
        return False

    # Prefer "Use existing model" (option 2) to preserve prior behavior.
    if not send_keys(agent_id, "2", send_enter=True):
        return False

    time.sleep(1.0)
    tail = capture_output(agent_id, lines=80) or ""
    if not _is_codex_model_choice_prompt(tail):
        return True

    # Fallback: move selection down then Enter (or just Enter if Down fails).
    _tmux_send_key(agent_id, 'Down')
    send_keys(agent_id, "", send_enter=True)
    time.sleep(1.0)
    tail_after = capture_output(agent_id, lines=80) or ""
    return not _is_codex_model_choice_prompt(tail_after)


def inject_system_prompt(agent_id: str, prompt: str) -> bool:
    """
    Inject system prompt to agent and wait for it to be processed.

    Args:
        agent_id: Agent ID (e.g., 'emp-0001')
        prompt: System prompt content

    Returns:
        True if injection successful
    """
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent))

    target = _agent_pane_target(agent_id)
    if not target:
        return False

    # Write prompt to a temp file for reliable multi-line injection
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write(prompt)
        f.write('\n')  # Ensure trailing newline
        temp_file = f.name

    try:
        # Use tmux's load-buffer to paste the content
        # This is more reliable than send-keys for multi-line content
        subprocess.run([
            'tmux', 'load-buffer', '-b', 'agent-prompt', temp_file
        ], capture_output=True, check=True)

        # Paste the buffer content
        subprocess.run([
            'tmux', 'paste-buffer', '-d', '-b', 'agent-prompt', '-t', target
        ], capture_output=True, check=True)

        # Wait a bit for paste to complete
        time.sleep(1)

        # Send Enter to execute the pasted content using load-buffer (more reliable)
        subprocess.run(
            ['tmux', 'load-buffer', '-b', 'enter-key', '-'],
            input='\n',
            capture_output=True,
            text=True,
            check=True,
        )
        subprocess.run(
            ['tmux', 'paste-buffer', '-d', '-b', 'enter-key', '-t', target],
            capture_output=True,
            text=True,
            check=True,
        )

        return True
    except Exception as e:
        print(f"  Debug: Injection error - {e}")
        return False
    finally:
        import os
        try:
            os.unlink(temp_file)
        except:
            pass


def wait_for_agent_ready(agent_id: str, launcher: str, timeout: int = 45) -> bool:
    """
    Wait for agent to be ready after system prompt injection.

    This checks if the agent has processed the system prompt and is ready for tasks.

    Args:
        agent_id: Agent ID (e.g., 'emp-0001')
        launcher: Launcher path/name to detect CLI type
        timeout: Maximum seconds to wait (default: 45)

    Returns:
        True if agent is ready, False if timeout
    """
    target = _agent_pane_target(agent_id)
    if not target:
        return False

    # Import provider system
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from providers import get_prompt_patterns

    prompt_patterns = get_prompt_patterns(launcher)

    start_time = time.time()
    check_interval = 2  # Check every 2 seconds
    min_wait = 3  # Minimum wait time before first check

    # Some TUIs (e.g., OpenCode) don't expose a stable prompt via tmux capture-pane.
    # In that case, treat "started" as "ready" after the minimum wait.
    if not prompt_patterns:
        time.sleep(min_wait)
        return True

    # Detect provider for special handling
    launcher_lower = launcher.lower()
    is_droid = 'droid' in launcher_lower
    is_codex = 'codex' in launcher_lower

    # Give agent time to process the prompt
    time.sleep(min_wait)

    codex_model_prompt_attempts = 0
    while (time.time() - start_time) < timeout:
        # Capture recent output
        result = subprocess.run([
            'tmux', 'capture-pane', '-p', '-t', target, '-S-15'
        ], capture_output=True, text=True)

        if result.returncode == 0:
            output = result.stdout

            # Special handling for droid: check for droid-specific patterns
            if is_droid:
                # Droid shows help text when ready
                if '? for help' in output or '/ide for VS Code' in output:
                    return True

            # Special handling for codex: dismiss first-run/upgrade model selection prompt.
            if is_codex and codex_model_prompt_attempts < 3 and _is_codex_model_choice_prompt(output):
                codex_model_prompt_attempts += 1
                _dismiss_codex_model_choice_prompt(agent_id)
                time.sleep(1.0)
                continue

            # Special handling for codex: prompt may include inline suggestions (e.g. "› Summarize...")
            if is_codex:
                for line in output.split('\n'):
                    stripped = line.strip()
                    if stripped.startswith(('›', '❯')) and not _CODEX_MENU_OPTION_RE.match(stripped):
                        return True
                # Also check for mode line which indicates readiness
                if 'Auto (High)' in output or 'shift+tab to cycle modes' in output:
                    return True

            # Check for prompt pattern (agent ready for input)
            for pattern in prompt_patterns:
                if pattern in output:
                    lines = output.split('\n')
                    for line in lines:
                        stripped = line.strip()
                        # For droid, be more lenient with prompt detection
                        if is_droid:
                            if stripped.startswith('>'):
                                return True
                        elif is_codex:
                            if stripped.startswith(pattern) and not _CODEX_MENU_OPTION_RE.match(stripped):
                                return True
                        else:
                            # Look for standalone prompt
                            if stripped == pattern or (stripped.startswith(pattern) and len(stripped) <= 3):
                                return True

        time.sleep(check_interval)

    return False


def get_session_info(agent_id: str) -> Optional[Dict[str, str]]:
    """
    Get detailed information about a session.

    Args:
        agent_id: Agent ID (e.g., 'emp-0001', without agent- prefix)

    Returns:
        Dict with 'agent_id', 'session', 'status', or None if not found
    """
    if not session_exists(agent_id):
        return None

    session_name = _session_name_for_agent(agent_id)
    if _tmux_has_session(session_name):
        # Get session info from tmux ls
        result = subprocess.run(['tmux', 'ls'], capture_output=True, text=True)

        if result.returncode != 0:
            return None

        for line in result.stdout.split('\n'):
            if line.startswith(f"{session_name}:"):
                # Parse session info (e.g., "agent-emp-0001: 1 windows (created Fri Jan  3 10:00:00 2025)")
                parts = line.split('(', 1)
                status = "running" if len(parts) > 1 else "unknown"

                return {
                    'agent_id': agent_id,
                    'session': session_name,
                    'status': status,
                    'mode': 'sessions',
                }

        return {
            'agent_id': agent_id,
            'session': session_name,
            'status': 'running',
            'mode': 'sessions',
        }

    if _group_window_exists(agent_id):
        group = get_group_session_name()
        window_name = _window_name_for_agent(agent_id)
        return {
            'agent_id': agent_id,
            'session': f"{group}:{window_name}",
            'status': 'running',
            'mode': 'windows',
        }

    return None


def is_agent_busy(agent_id: str, launcher: str = "") -> bool:
    """
    Check if an agent is currently busy (processing/thinking).

    Args:
        agent_id: Agent ID (e.g., 'emp-0001')
        launcher: Optional launcher path for provider-specific detection

    Returns:
        True if agent is busy (should not send new tasks)
    """
    if not session_exists(agent_id):
        return False

    target = _agent_pane_target(agent_id)
    if not target:
        return False

    # Capture only the last few lines to detect current state
    # Using -5 to avoid matching old output that scrolled by
    result = subprocess.run([
        'tmux', 'capture-pane', '-p', '-t', target, '-S-5'
    ], capture_output=True, text=True)

    if result.returncode != 0:
        return True  # If we can't read, assume busy

    output = result.stdout

    # Provider-specific activity indicators.
    try:
        import sys
        from pathlib import Path

        sys.path.insert(0, str(Path(__file__).parent.parent))
        from providers import get_busy_patterns

        busy_patterns = get_busy_patterns(launcher)
    except Exception:
        busy_patterns = []

    # Fallback patterns (minimal, cross-provider).
    if not busy_patterns:
        busy_patterns = [
            '✻ Thinking',
            'Thinking...',
            '⏳ Thinking',
            '(esc to interrupt',
        ]

    for pattern in busy_patterns:
        if pattern in output:
            return True

    return False


def _parse_elapsed_seconds(output: str) -> Optional[int]:
    """Best-effort parse of an on-screen elapsed timer (e.g., "[⏱ 5m 7s]")."""
    if not output:
        return None

    match = re.search(r"\[\s*(?:⏱|⏳)\s*(\d+)m\s*(\d+)s\s*\]", output)
    if match:
        minutes = int(match.group(1))
        seconds = int(match.group(2))
        return minutes * 60 + seconds

    match = re.search(r"\[\s*(?:⏱|⏳)\s*(\d+)s\s*\]", output)
    if match:
        return int(match.group(1))

    match = re.search(r"\b(\d+\.\d+)s\b", output)
    if match:
        try:
            return int(float(match.group(1)))
        except Exception:
            return None

    return None


def _detect_error_reason(output: str) -> Optional[str]:
    """Best-effort detect a terminal/tool error in recent agent output.

    This is intentionally heuristic: we only use it to decide whether an agent
    is "idle" versus "error" (needs restart/retry).
    """
    if not output:
        return None

    lowered = output.lower()

    # Network / gateway issues seen in this repo.
    if 'stopped after 10 redirects' in lowered:
        return 'redirect_loop'
    if 'error 522' in lowered or 'cloudflare ray id' in lowered:
        return 'cloudflare_522'
    if 'error: 500 post ' in lowered:
        return 'http_500'

    # Provider/model config issues.
    if 'api error: 400' in lowered and 'unknown provider' in lowered:
        return 'unknown_provider'
    if 'invalid_request_error' in lowered:
        return 'invalid_request'

    # Generic timeouts / connection failures.
    if 'timed out' in lowered or 'timeout' in lowered:
        return 'timeout'
    if 'econnrefused' in lowered or 'connection refused' in lowered:
        return 'connection_refused'
    if 'etimedout' in lowered:
        return 'connection_timed_out'

    return None


def is_agent_blocked(agent_id: str, launcher: str = "") -> bool:
    """Detect whether an agent is blocked on approvals/user input (best-effort)."""
    if not session_exists(agent_id):
        return False

    target = _agent_pane_target(agent_id)
    if not target:
        return False
    result = subprocess.run(
        ['tmux', 'capture-pane', '-p', '-t', target, '-S-30'],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return False

    output = result.stdout
    try:
        import sys
        from pathlib import Path

        sys.path.insert(0, str(Path(__file__).parent.parent))
        from providers import get_blocked_patterns

        blocked_patterns = get_blocked_patterns(launcher)
    except Exception:
        blocked_patterns = []

    if not blocked_patterns:
        blocked_patterns = [
            'all actions require approval',
            'actions require approval',
            'requires approval',
            'waiting for approval',
        ]

    return any(p in output for p in blocked_patterns)


def get_agent_runtime_state(agent_id: str, launcher: str = "") -> Dict[str, object]:
    """Return a more truthful runtime state than just "tmux session exists".

    States:
      - stopped: no tmux session
      - blocked: waiting on approvals/user input
      - error: last action failed (network/provider/etc) and agent is otherwise idle
      - stuck: busy for a long time (heuristic)
      - busy: actively processing
      - idle: running and ready
    """
    if not session_exists(agent_id):
        return {'state': 'stopped'}

    target = _agent_pane_target(agent_id)
    if not target:
        return {'state': 'busy', 'reason': 'missing_tmux_target'}
    result = subprocess.run(
        # Capture a larger window so we can reliably detect error pages/output
        # (e.g., Cloudflare 522 HTML) that may not fit in the last ~40 lines.
        ['tmux', 'capture-pane', '-p', '-t', target, '-S-200'],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        return {'state': 'busy', 'reason': 'unreadable_output'}

    output = result.stdout
    elapsed_seconds = _parse_elapsed_seconds(output)

    # Codex can present a first-run/upgrade model selection prompt that looks "idle"
    # but actually blocks all automation (cron + tmux send-keys). Dismiss it if present.
    if launcher and 'codex' in launcher.lower() and _is_codex_model_choice_prompt(output):
        now = time.time()
        last_failure = _CODEX_MODEL_PROMPT_LAST_FAILURE.get(agent_id)
        if last_failure is not None and (now - last_failure) < _CODEX_MODEL_PROMPT_FAILURE_THROTTLE_S:
            return {
                'state': 'blocked',
                'reason': 'codex_model_choice',
                'elapsed_seconds': elapsed_seconds,
            }

        if _dismiss_codex_model_choice_prompt(agent_id):
            # Give Codex a moment to redraw after dismissing the menu, then re-evaluate.
            time.sleep(0.5)
            recapture = subprocess.run(
                ['tmux', 'capture-pane', '-p', '-t', target, '-S-200'],
                capture_output=True,
                text=True,
            )
            if recapture.returncode == 0:
                output = recapture.stdout
                elapsed_seconds = _parse_elapsed_seconds(output)
            else:
                return {'state': 'busy', 'reason': 'unreadable_output'}
        else:
            _CODEX_MODEL_PROMPT_LAST_FAILURE[agent_id] = now
            return {
                'state': 'blocked',
                'reason': 'codex_model_choice',
                'elapsed_seconds': elapsed_seconds,
            }

    if is_agent_blocked(agent_id, launcher=launcher):
        return {
            'state': 'blocked',
            'elapsed_seconds': elapsed_seconds,
        }

    if is_agent_busy(agent_id, launcher=launcher):
        stuck_after_seconds = 180
        try:
            import sys
            from pathlib import Path

            sys.path.insert(0, str(Path(__file__).parent.parent))
            from providers import get_stuck_after_seconds

            stuck_after_seconds = int(get_stuck_after_seconds(launcher))
        except Exception:
            stuck_after_seconds = 180

        if elapsed_seconds is not None and elapsed_seconds >= stuck_after_seconds:
            return {
                'state': 'stuck',
                'elapsed_seconds': elapsed_seconds,
            }
        return {
            'state': 'busy',
            'elapsed_seconds': elapsed_seconds,
        }

    error_reason = _detect_error_reason(output)
    if error_reason:
        return {
            'state': 'error',
            'reason': error_reason,
            'elapsed_seconds': elapsed_seconds,
        }

    return {
        'state': 'idle',
        'elapsed_seconds': elapsed_seconds,
    }


def attach_session(agent_id: str) -> bool:
    """
    Attach to a tmux session (for interactive use).

    Args:
        agent_id: Agent ID (e.g., 'emp-0001', without agent- prefix)

    Returns:
        True if attachment succeeded (note: this blocks the terminal)
    """
    if not session_exists(agent_id):
        return False

    attach_target = _agent_attach_target(agent_id)
    if not attach_target:
        return False

    # This will block and take over the terminal
    result = subprocess.run(['tmux', 'attach', '-t', attach_target])

    return result.returncode == 0


def wait_for_prompt(agent_id: str, launcher: str, timeout: int = 30) -> bool:
    """
    Wait for CLI prompt to appear in the session.

    Args:
        agent_id: Agent ID (e.g., 'emp-0001')
        launcher: Launcher path/name to detect CLI type
        timeout: Maximum seconds to wait (default: 30)

    Returns:
        True if prompt detected, False if timeout
    """
    # Import provider system
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from providers import get_prompt_patterns, get_startup_wait, PROVIDERS

    target = _agent_pane_target(agent_id)
    if not target:
        return False

    # Get prompt patterns based on launcher (provider)
    prompt_patterns = get_prompt_patterns(launcher)
    startup_wait = get_startup_wait(launcher)

    # Detect provider for special handling
    launcher_lower = launcher.lower()
    is_droid = 'droid' in launcher_lower
    is_codex = 'codex' in launcher_lower

    # Initial wait for CLI to start
    time.sleep(startup_wait)

    # Some TUIs (e.g., OpenCode) don't expose a stable prompt via tmux capture-pane.
    # In that case, treat "started" as "ready" after startup_wait.
    if not prompt_patterns:
        return True

    start_time = time.time()
    check_interval = 1  # Check every second

    codex_model_prompt_attempts = 0
    while (time.time() - start_time) < timeout:
        # Capture last few lines of output
        result = subprocess.run([
            'tmux', 'capture-pane', '-p', '-t', target, '-S-20'
        ], capture_output=True, text=True)

        if result.returncode == 0:
            output = result.stdout

            # Special handling for droid: check for droid-specific patterns
            if is_droid:
                # Droid shows help text when ready
                if '? for help' in output or '/ide for VS Code' in output:
                    return True

            # Special handling for codex: dismiss first-run/upgrade model selection prompt.
            if is_codex and codex_model_prompt_attempts < 3 and _is_codex_model_choice_prompt(output):
                codex_model_prompt_attempts += 1
                _dismiss_codex_model_choice_prompt(agent_id)
                time.sleep(1.0)
                continue

            # Special handling for codex: prompt may include inline suggestions (e.g. "› Summarize...")
            if is_codex:
                for line in output.split('\n'):
                    stripped = line.strip()
                    if stripped.startswith(('›', '❯')) and not _CODEX_MENU_OPTION_RE.match(stripped):
                        return True
                # Also check for mode line which indicates readiness
                if 'Auto (High)' in output or 'shift+tab to cycle modes' in output:
                    return True

            # Standard prompt detection
            for pattern in prompt_patterns:
                if pattern in output:
                    lines = output.split('\n')
                    for line in lines:
                        stripped = line.strip()
                        # For droid, be more lenient with prompt detection
                        if is_droid:
                            if stripped.startswith('>'):
                                return True
                        elif is_codex:
                            if stripped.startswith(pattern) and not _CODEX_MENU_OPTION_RE.match(stripped):
                                return True
                        else:
                            # Standard check: line is just the prompt
                            if stripped == pattern or (stripped.startswith(pattern) and len(stripped) <= 3):
                                return True

        time.sleep(check_interval)

    return False
