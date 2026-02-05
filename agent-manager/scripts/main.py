#!/usr/bin/env python3
"""
Agent Manager - CLI for managing employee agents in tmux sessions.

A simple alternative to CAO using only tmux + Python.
Sessions are named: agent-{agent_id} where agent_id is file_id in lowercase (e.g., emp-0001)
"""

import argparse
import json
import os
import re
import shlex
import subprocess
import sys
import time
from pathlib import Path
from typing import Optional

# Add scripts directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from agent_config import (
    resolve_agent,
    list_all_agents,
    load_skills,
    build_system_prompt,
    expand_env_vars,
    get_launcher_command,
    get_agent_schedule,
    get_schedule_task,
    parse_duration,
)

from repo_root import get_repo_root
from tmux_helper import (
    check_tmux,
    list_sessions,
    session_exists,
    start_session,
    start_session_with_layout,
    stop_session,
    capture_output,
    send_keys,
    get_session_info,
    wait_for_prompt,
    inject_system_prompt,
    wait_for_agent_ready,
    is_agent_busy,
    get_agent_runtime_state,
)

# Import provider system (lives at .agent/skills/agent-manager/providers)
sys.path.insert(0, str(Path(__file__).parent.parent))
from providers import (
    get_system_prompt_mode,
    get_system_prompt_flag,
    get_system_prompt_key,
    get_agents_md_mode,
    get_mcp_config_mode,
    get_mcp_config_flag,
    resolve_launcher_command,
    get_provider_key,
    get_session_restore_mode,
    get_session_restore_flag,
)


def _normalize_path(path: str) -> str:
    try:
        return str(Path(path).resolve())
    except Exception:
        return os.path.abspath(path)


def _provider_sessions_state_dir(repo_root: Path) -> Path:
    return repo_root / '.claude' / 'state' / 'agent-manager' / 'provider-sessions'


def _load_provider_session_id(repo_root: Path, provider: str, agent_id: str) -> str:
    path = _provider_sessions_state_dir(repo_root) / provider / f"{agent_id}.json"
    try:
        payload = json.loads(path.read_text(encoding='utf-8'))
        session_id = str(payload.get('session_id') or '').strip()
        return session_id
    except Exception:
        return ""


def _save_provider_session_id(repo_root: Path, provider: str, agent_id: str, *, session_id: str, cwd: str) -> None:
    provider_dir = _provider_sessions_state_dir(repo_root) / provider
    provider_dir.mkdir(parents=True, exist_ok=True)
    path = provider_dir / f"{agent_id}.json"
    payload = {
        'provider': provider,
        'agent_id': agent_id,
        'session_id': session_id,
        'cwd': cwd,
        'updated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding='utf-8')


def _droid_sessions_dir_for_cwd(cwd: str) -> Path:
    normalized = _normalize_path(cwd)
    folder_name = "-" + normalized.lstrip('/').replace('/', '-')
    return Path.home() / '.factory' / 'sessions' / folder_name


def _droid_session_jsonl_path(cwd: str, session_id: str) -> Path:
    return _droid_sessions_dir_for_cwd(cwd) / f"{session_id}.jsonl"


def _droid_session_exists(cwd: str, session_id: str) -> bool:
    if not session_id:
        return False
    try:
        return _droid_session_jsonl_path(cwd, session_id).exists()
    except Exception:
        return False


def _snapshot_droid_sessions(cwd: str) -> set[str]:
    sessions_dir = _droid_sessions_dir_for_cwd(cwd)
    if not sessions_dir.exists() or not sessions_dir.is_dir():
        return set()
    return {str(p) for p in sessions_dir.glob('*.jsonl')}


def _extract_droid_session_id_from_jsonl(jsonl_path: Path) -> str:
    try:
        with jsonl_path.open('r', encoding='utf-8') as f:
            for _ in range(10):
                line = f.readline()
                if not line:
                    break
                line = line.strip()
                if not line:
                    continue
                payload = json.loads(line)
                if payload.get('type') == 'session_start':
                    return str(payload.get('id') or '').strip()
        return ""
    except Exception:
        return ""


def _find_new_droid_session_id(cwd: str, *, before_jsonl_paths: set[str]) -> str:
    sessions_dir = _droid_sessions_dir_for_cwd(cwd)
    if not sessions_dir.exists() or not sessions_dir.is_dir():
        return ""

    candidates = [p for p in sessions_dir.glob('*.jsonl') if str(p) not in before_jsonl_paths]
    if not candidates:
        return ""

    newest = max(candidates, key=lambda p: p.stat().st_mtime)
    return _extract_droid_session_id_from_jsonl(newest)


def _find_new_droid_session_id_with_retry(cwd: str, *, before_jsonl_paths: set[str], timeout_s: float = 2.0) -> str:
    deadline = time.time() + max(0.0, float(timeout_s))
    while True:
        session_id = _find_new_droid_session_id(cwd, before_jsonl_paths=before_jsonl_paths)
        if session_id:
            return session_id
        if time.time() >= deadline:
            return ""
        time.sleep(0.2)


_UUID_RE = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")


def _looks_like_uuid(value: str) -> bool:
    return bool(value and _UUID_RE.match(value))


def _claude_projects_dir_for_cwd(cwd: str) -> Path:
    normalized = _normalize_path(cwd)
    folder_name = "-" + normalized.lstrip('/').replace('/', '-')
    return Path.home() / '.claude' / 'projects' / folder_name


def _claude_session_jsonl_path(cwd: str, session_id: str) -> Path:
    return _claude_projects_dir_for_cwd(cwd) / f"{session_id}.jsonl"


def _claude_session_exists(cwd: str, session_id: str) -> bool:
    if not _looks_like_uuid(session_id):
        return False
    try:
        return _claude_session_jsonl_path(cwd, session_id).exists()
    except Exception:
        return False


def _snapshot_claude_sessions(cwd: str) -> set[str]:
    sessions_dir = _claude_projects_dir_for_cwd(cwd)
    if not sessions_dir.exists() or not sessions_dir.is_dir():
        return set()
    return {str(p) for p in sessions_dir.glob('*.jsonl')}


def _extract_claude_session_id_from_jsonl(jsonl_path: Path) -> str:
    try:
        with jsonl_path.open('r', encoding='utf-8') as f:
            for _ in range(10):
                line = f.readline()
                if not line:
                    break
                line = line.strip()
                if not line:
                    continue
                payload = json.loads(line)
                session_id = str(payload.get('sessionId') or payload.get('session_id') or '').strip()
                if _looks_like_uuid(session_id):
                    return session_id
        return ""
    except Exception:
        return ""


def _find_new_claude_session_id(cwd: str, *, before_jsonl_paths: set[str]) -> str:
    sessions_dir = _claude_projects_dir_for_cwd(cwd)
    if not sessions_dir.exists() or not sessions_dir.is_dir():
        return ""

    candidates = [p for p in sessions_dir.glob('*.jsonl') if str(p) not in before_jsonl_paths]
    if not candidates:
        # Best-effort fallback: pick newest session file we can parse.
        candidates = list(sessions_dir.glob('*.jsonl'))
    if not candidates:
        return ""

    for candidate in sorted(candidates, key=lambda p: p.stat().st_mtime, reverse=True):
        session_id = _extract_claude_session_id_from_jsonl(candidate)
        if session_id:
            return session_id

    return ""


def _find_new_claude_session_id_with_retry(cwd: str, *, before_jsonl_paths: set[str], timeout_s: float = 2.0) -> str:
    deadline = time.time() + max(0.0, float(timeout_s))
    while True:
        session_id = _find_new_claude_session_id(cwd, before_jsonl_paths=before_jsonl_paths)
        if session_id:
            return session_id
        if time.time() >= deadline:
            return ""
        time.sleep(0.2)


def _opencode_storage_dir() -> Path:
    return Path.home() / '.local' / 'share' / 'opencode' / 'storage'


def _opencode_project_id_for_cwd(cwd: str) -> str:
    normalized = _normalize_path(cwd)
    project_dir = _opencode_storage_dir() / 'project'
    if not project_dir.exists() or not project_dir.is_dir():
        return ""

    for p in project_dir.glob('*.json'):
        try:
            payload = json.loads(p.read_text(encoding='utf-8'))
            worktree = str(payload.get('worktree') or '').strip()
            if worktree and _normalize_path(worktree) == normalized:
                return str(payload.get('id') or p.stem).strip()
        except Exception:
            continue

    return ""


def _opencode_sessions_dir_for_project(project_id: str) -> Path:
    return _opencode_storage_dir() / 'session' / project_id


def _opencode_session_json_path(cwd: str, session_id: str) -> Path:
    project_id = _opencode_project_id_for_cwd(cwd)
    return _opencode_sessions_dir_for_project(project_id) / f"{session_id}.json"


def _opencode_session_exists(cwd: str, session_id: str) -> bool:
    if not session_id or not session_id.startswith('ses_'):
        return False
    project_id = _opencode_project_id_for_cwd(cwd)
    if not project_id:
        return False
    try:
        return (_opencode_sessions_dir_for_project(project_id) / f"{session_id}.json").exists()
    except Exception:
        return False


def _snapshot_opencode_sessions(cwd: str) -> set[str]:
    project_id = _opencode_project_id_for_cwd(cwd)
    if not project_id:
        return set()
    sessions_dir = _opencode_sessions_dir_for_project(project_id)
    if not sessions_dir.exists() or not sessions_dir.is_dir():
        return set()
    return {str(p) for p in sessions_dir.glob('*.json')}


def _extract_opencode_session_id_from_json(json_path: Path) -> str:
    try:
        payload = json.loads(json_path.read_text(encoding='utf-8'))
        session_id = str(payload.get('id') or '').strip()
        if session_id.startswith('ses_'):
            return session_id
        return ""
    except Exception:
        return ""


def _find_new_opencode_session_id(cwd: str, *, before_json_paths: set[str]) -> str:
    project_id = _opencode_project_id_for_cwd(cwd)
    if not project_id:
        return ""
    sessions_dir = _opencode_sessions_dir_for_project(project_id)
    if not sessions_dir.exists() or not sessions_dir.is_dir():
        return ""

    candidates = [p for p in sessions_dir.glob('*.json') if str(p) not in before_json_paths]
    if not candidates:
        candidates = list(sessions_dir.glob('*.json'))
    if not candidates:
        return ""

    for candidate in sorted(candidates, key=lambda p: p.stat().st_mtime, reverse=True):
        session_id = _extract_opencode_session_id_from_json(candidate)
        if session_id:
            return session_id

    return ""


def _find_new_opencode_session_id_with_retry(cwd: str, *, before_json_paths: set[str], timeout_s: float = 2.0) -> str:
    deadline = time.time() + max(0.0, float(timeout_s))
    while True:
        session_id = _find_new_opencode_session_id(cwd, before_json_paths=before_json_paths)
        if session_id:
            return session_id
        if time.time() >= deadline:
            return ""
        time.sleep(0.2)


def _provider_session_exists(provider_key: str, cwd: str, session_id: str) -> bool:
    if provider_key == 'droid':
        return _droid_session_exists(cwd, session_id)
    if provider_key in {'claude', 'claude-code'}:
        return _claude_session_exists(cwd, session_id)
    if provider_key == 'opencode':
        return _opencode_session_exists(cwd, session_id)
    return False


def _snapshot_provider_sessions(provider_key: str, cwd: str) -> set[str]:
    if provider_key == 'droid':
        return _snapshot_droid_sessions(cwd)
    if provider_key in {'claude', 'claude-code'}:
        return _snapshot_claude_sessions(cwd)
    if provider_key == 'opencode':
        return _snapshot_opencode_sessions(cwd)
    return set()


def _find_new_provider_session_id_with_retry(provider_key: str, cwd: str, *, before_paths: set[str], timeout_s: float = 2.0) -> str:
    if provider_key == 'droid':
        return _find_new_droid_session_id_with_retry(cwd, before_jsonl_paths=before_paths, timeout_s=timeout_s)
    if provider_key in {'claude', 'claude-code'}:
        return _find_new_claude_session_id_with_retry(cwd, before_jsonl_paths=before_paths, timeout_s=timeout_s)
    if provider_key == 'opencode':
        return _find_new_opencode_session_id_with_retry(cwd, before_json_paths=before_paths, timeout_s=timeout_s)
    return ""


def _apply_session_restore_args(
    provider_key: str,
    launcher: str,
    launcher_args: list[str],
    restore_flag: str,
    session_id: str,
) -> list[str]:
    """Insert provider resume args without breaking wrapper launchers.

    For the repo-local `ccc` wrapper, the first arg is a model/account selector and
    must stay first; claude options follow after.
    """
    launcher_lower = (launcher or "").lower()
    if provider_key == 'claude-code' and 'ccc' in launcher_lower:
        if launcher_args and not str(launcher_args[0]).startswith('-'):
            return [launcher_args[0], restore_flag, session_id] + launcher_args[1:]
    return [restore_flag, session_id] + list(launcher_args or [])


def write_system_prompt_file(repo_root: Path, agent_id: str, system_prompt: str) -> Path:
    state_dir = repo_root / '.claude' / 'state' / 'system-prompts'
    state_dir.mkdir(parents=True, exist_ok=True)
    prompt_file = state_dir / f"{agent_id}.txt"
    prompt_file.write_text(system_prompt + "\n", encoding='utf-8')
    return prompt_file


def write_scheduled_task_file(repo_root: Path, agent_id: str, job: str, task: str) -> Path:
    state_dir = repo_root / '.claude' / 'state' / 'agent-manager' / 'scheduled-tasks' / agent_id
    state_dir.mkdir(parents=True, exist_ok=True)
    safe_job = "".join(ch if (ch.isalnum() or ch in ('-', '_')) else '-' for ch in (job or 'job'))
    task_file = state_dir / f"{safe_job}.md"
    task_file.write_text(task + "\n", encoding='utf-8')
    return task_file


def build_mcp_config_json(agent_config: dict) -> str:
    """Build MCP config JSON for provider CLIs that support it.

    Agent frontmatter uses `mcps` (a mapping of server_name -> server_config).
    For Claude Code, we pass a JSON object with `mcpServers`.
    """
    mcps = agent_config.get('mcps')
    if mcps is None:
        mcps = {}

    if not isinstance(mcps, dict):
        raise ValueError("Invalid 'mcps' in agent config (expected a mapping)")

    if not mcps:
        return ""

    payload = {"mcpServers": mcps}
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":"))


def cleanup_old_logs(repo_root: Path, days: int = 7) -> int:
    """Remove log files older than specified days.

    Args:
        repo_root: Repository root path
        days: Number of days to retain logs (default: 7)

    Returns:
        Number of log files removed
    """
    log_dir = repo_root / '.crontab_logs'
    if not log_dir.exists():
        # Create log directory if it doesn't exist
        log_dir.mkdir(parents=True, exist_ok=True)
        return 0

    cutoff = time.time() - (days * 86400)
    removed = 0

    for log_file in log_dir.glob("*.log"):
        try:
            if log_file.stat().st_mtime < cutoff:
                log_file.unlink()
                removed += 1
        except (OSError, IOError):
            # Silently skip files that can't be removed
            pass

    return removed


def build_start_command(working_dir: str, launcher: str, launcher_args: list[str]) -> str:
    # Cron/tmux often runs with a minimal PATH; include common user-local bin dirs so
    # launchers like `ccc` can find `claude` (usually installed under ~/.local/bin).
    env_part = 'export PATH="$HOME/.local/bin:$HOME/bin:$PATH"'
    cd_part = f"cd {shlex.quote(working_dir)}"
    cmd_parts = [launcher] + list(launcher_args or [])
    exec_part = " ".join(shlex.quote(str(part)) for part in cmd_parts if part is not None and str(part) != "")
    return f"{env_part} && {cd_part} && {exec_part}".strip()


def get_agent_id(config: dict) -> str:
    """Get agent_id from config (file_id in lowercase, with hyphens)."""
    file_id = config.get('file_id', 'UNKNOWN')
    return file_id.lower().replace('_', '-')


def cmd_list(args):
    """List all agents (configured and running)."""
    all_agents = list_all_agents()
    running_sessions = set(list_sessions())

    print("📋 Agents:")
    print()

    if not all_agents:
        print("  No agents configured in agents/")
        return

    for file_id, config in sorted(all_agents.items(), key=lambda item: item[0]):
        agent_name = config.get('name') or file_id
        agent_id = get_agent_id(config)
        is_running = agent_id in running_sessions
        is_enabled = config.get('enabled', True)

        # Skip if --running and not active
        if args.running and not is_running:
            continue

        # Status indicator - show: agent-emp-0001(dev)
        if is_running:
            status = "✅ Running"
            session_info = get_session_info(agent_id)
            if session_info:
                print(f"{status} {session_info['session']}({agent_name})")
            else:
                print(f"{status} agent-{agent_id}({agent_name})")
        elif not is_enabled:
            status = "⛔ Disabled"
            print(f"{status} agent-{agent_id}({agent_name})")
            print(f"   Description: {config.get('description', 'No description')}")
            print(f"   Working Dir: {config.get('working_directory', 'N/A')}")
            print()
            continue
        else:
            status = "⭕ Stopped"
            print(f"{status} agent-{agent_id}({agent_name})")

        print(f"   Description: {config.get('description', 'No description')}")
        print(f"   Working Dir: {config.get('working_directory', 'N/A')}")

        skills = config.get('skills', [])
        if skills:
            print(f"   Skills: {', '.join(skills)}")

        print()


def _tmux_install_hint() -> str:
    if sys.platform == 'darwin':
        return 'brew install tmux'
    if sys.platform.startswith('linux'):
        return 'sudo apt install tmux'
    return 'Install tmux and ensure it is on PATH'


def cmd_doctor(args):
    """Run basic environment checks for agent-manager."""
    repo_root = get_repo_root()
    agents_dir = repo_root / 'agents'
    skills_dir = repo_root / '.agent' / 'skills'
    claude_dir = repo_root / '.claude'

    problems = 0

    print("🩺 agent-manager doctor")
    print()
    print(f"Repo root: {repo_root}")
    print(f"Python: {sys.version.split()[0]} ({sys.executable})")
    print(f"Platform: {sys.platform}")
    print()

    if check_tmux():
        print("✅ tmux: found")
    else:
        problems += 1
        print("❌ tmux: missing")
        print(f"   Fix: {_tmux_install_hint()}")

    if agents_dir.exists() and agents_dir.is_dir():
        agents = list_all_agents(agents_dir)
        print(f"✅ agents/: found ({len(agents)} configured)")
    else:
        problems += 1
        print("❌ agents/: missing")
        print(f"   Expected at: {agents_dir}")

    if skills_dir.exists() and skills_dir.is_dir():
        print("✅ .agent/skills/: found")
    else:
        print("⚠️  .agent/skills/: missing")
        print(f"   Expected at: {skills_dir}")

    if claude_dir.exists() and claude_dir.is_dir():
        print("✅ .claude/: found")
    else:
        print("⚠️  .claude/: missing")
        print(f"   Expected at: {claude_dir}")

    try:
        result = subprocess.run(['crontab', '-l'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ crontab: readable")
        else:
            # macOS exits non-zero when no crontab exists; treat as warning.
            print("⚠️  crontab: not set (or not readable)")
    except FileNotFoundError:
        problems += 1
        print("❌ crontab: command not found")

    if args.deep and agents_dir.exists() and agents_dir.is_dir():
        print()
        print("🔎 Deep checks:")
        agents = list_all_agents(agents_dir)
        for file_id, config in sorted(agents.items(), key=lambda item: item[0]):
            agent_id = get_agent_id(config)
            working_dir = config.get('working_directory')
            launcher = resolve_launcher_command(config.get('launcher', ''))
            enabled = config.get('enabled', True)

            status = "✅" if enabled else "⛔"
            print(f"{status} {file_id} (agent-{agent_id})")
            if working_dir:
                wd_ok = Path(working_dir).exists()
                print(f"   Working dir: {working_dir} ({'ok' if wd_ok else 'missing'})")
                if not wd_ok and enabled:
                    problems += 1
            else:
                print("   Working dir: (not set)")
                if enabled:
                    problems += 1

            if launcher:
                print(f"   Launcher: {launcher}")
            else:
                print("   Launcher: (not set)")

    print()
    if problems:
        print(f"❌ Doctor found {problems} problem(s)")
        return 1
    print("✅ Doctor checks passed")
    return 0


def cmd_start(args):
    """Start an agent in tmux session."""
    # Check tmux
    if not check_tmux():
        print("❌ tmux is not installed. Install with: apt install tmux")
        return 1

    # Resolve agent
    agent_config = resolve_agent(args.agent)
    if not agent_config:
        print(f"❌ Agent not found: {args.agent}")
        print("   Available agents:")
        all_agents = list_all_agents()
        for file_id, config in sorted(all_agents.items(), key=lambda item: item[0]):
            name = config.get('name') or file_id
            agent_id = get_agent_id(config)
            print(f"   - {file_id} ({name}) (agent-{agent_id})")
        return 1

    agent_name = agent_config['name']
    agent_id = get_agent_id(agent_config)
    agent_file_id = agent_config.get('file_id', args.agent)

    # Check if agent is disabled
    if not agent_config.get('enabled', True):
        agent_file_path = agent_config.get('_file_path', f'agents/{agent_file_id}.md')
        print(f"⚠️  Agent '{agent_name}' is disabled")
        print(f"   Config: {agent_file_path}")
        print(f"   To enable: Set 'enabled: true' in the agent config")
        return 1

    # Check if already running
    if session_exists(agent_id):
        session_info = get_session_info(agent_id) or {}
        session_name = session_info.get('session', f"agent-{agent_id}")
        if getattr(args, 'restore', True):
            print(f"✅ Restored existing session for '{agent_name}'")
            print(f"   Session: {session_name}({agent_name})")
            if getattr(args, 'working_dir', None):
                print(f"   Note: --working-dir is ignored when restoring")
            print()
            if session_info.get('mode') == 'windows':
                group = session_name.split(':', 1)[0]
                print(f"Attach with: tmux attach -t {group}")
            else:
                print(f"Attach with: tmux attach -t {session_name}")
            print(f"Monitor with: python3 {Path(__file__).name} monitor {agent_file_id}")
            return 0

        print(f"⚠️  Agent '{agent_name}' is already running")
        print(f"   Session: {session_name}({agent_name})")
        print()
        print(f"   To stop first: python3 {Path(__file__).name} stop {agent_file_id}")
        if session_info.get('mode') == 'windows':
            group = session_name.split(':', 1)[0]
            print(f"   Or attach directly: tmux attach -t {group}")
        else:
            print(f"   Or attach directly: tmux attach -t {session_name}")
        print(f"   Or restore (reuse existing): python3 {Path(__file__).name} start {agent_file_id} --restore")
        return 1

    # Override working directory if specified
    working_dir = args.working_dir or agent_config.get('working_directory')
    if not working_dir:
        print("❌ No working directory specified")
        return 1

    working_dir = _normalize_path(working_dir)

    repo_root = get_repo_root()
    skills_dir = repo_root / '.agent' / 'skills'

    # Build launcher command
    launcher = resolve_launcher_command(agent_config.get('launcher', ''))
    launcher_args = list(agent_config.get('launcher_args', []) or [])

    # Provider-aware restore: prefer resuming the provider session with an explicit sessionId.
    provider_key = get_provider_key(launcher)
    did_provider_restore = False
    provider_before_sessions: set[str] = set()

    track_provider_session = provider_key in {'droid', 'claude', 'claude-code', 'opencode'}
    if provider_key == 'droid' and 'exec' in launcher_args:
        # `droid exec ...` doesn't create a resumable session in ~/.factory/sessions.
        track_provider_session = False

    if track_provider_session:
        provider_before_sessions = _snapshot_provider_sessions(provider_key, working_dir)

    if getattr(args, 'restore', True) and track_provider_session:
        restore_mode = get_session_restore_mode(launcher)
        restore_flag = get_session_restore_flag(launcher)
        if restore_mode == 'cli_optional_arg' and restore_flag:
            stored_session_id = _load_provider_session_id(repo_root, provider_key, agent_id)
            if stored_session_id and _provider_session_exists(provider_key, working_dir, stored_session_id):
                launcher_args = _apply_session_restore_args(
                    provider_key,
                    launcher,
                    launcher_args,
                    restore_flag,
                    stored_session_id,
                )
                did_provider_restore = True
            elif stored_session_id:
                print(f"⚠️  Stored {provider_key} sessionId not found for cwd; starting fresh")

    # Build system prompt early so supported providers can receive it at process start.
    system_prompt = build_system_prompt(agent_config, repo_root=repo_root, skills_dir=skills_dir)
    system_prompt_mode = get_system_prompt_mode(launcher)
    system_prompt_flag = get_system_prompt_flag(launcher)
    system_prompt_key = get_system_prompt_key(launcher)

    # If the underlying provider reads AGENTS.md from the working directory, prefer that
    # mechanism and skip injecting an additional agent-manager system prompt.
    if system_prompt and not did_provider_restore and get_agents_md_mode(launcher) == 'cwd':
        if (Path(working_dir) / 'AGENTS.md').exists():
            print("ℹ️  AGENTS.md found in working directory; skipping system prompt injection")
            system_prompt = ""

    # Build MCP config early so supported providers can receive it at process start.
    mcp_config_mode = get_mcp_config_mode(launcher)
    mcp_config_flag = get_mcp_config_flag(launcher)
    try:
        mcp_config_json = build_mcp_config_json(agent_config)
    except ValueError as e:
        print(f"❌ {e}")
        return 1

    use_cli_system_prompt = bool(
        system_prompt
        and not did_provider_restore
        and system_prompt_mode in {'cli_append', 'cli_config_kv'}
        and system_prompt_flag
        and (system_prompt_mode != 'cli_config_kv' or system_prompt_key)
    )
    command = build_start_command(working_dir, launcher, launcher_args)

    if use_cli_system_prompt:
        prompt_file = write_system_prompt_file(repo_root, agent_id, system_prompt)

        if system_prompt_mode == 'cli_append':
            command = f"{command} {shlex.quote(system_prompt_flag)} \"$(cat {shlex.quote(str(prompt_file))})\""
        elif system_prompt_mode == 'cli_config_kv':
            # Codex `-c/--config` expects a single `key=value` argument, where value is parsed as TOML.
            # Use a TOML string literal for the file path (double-quoted).
            toml_path = json.dumps(str(prompt_file))
            kv = f"{system_prompt_key}={toml_path}"
            command = f"{command} {shlex.quote(system_prompt_flag)} {shlex.quote(kv)}"

    # Inject MCP config if provider supports it.
    if mcp_config_json and not did_provider_restore:
        if mcp_config_mode == 'cli_json' and mcp_config_flag:
            command = f"{command} {shlex.quote(mcp_config_flag)} {shlex.quote(mcp_config_json)}"
        else:
            print(f"⚠️  MCP config present but not supported for launcher '{launcher}' - ignoring")
    elif mcp_config_json and did_provider_restore:
        print(f"ℹ️  Provider session restored; skipping MCP config injection")

    tmux_config = agent_config.get('tmux') or {}
    if tmux_config and not isinstance(tmux_config, dict):
        print("❌ Invalid 'tmux' in agent config (expected a mapping)")
        return 1

    tmux_layout_spec = tmux_config.get('layout') if tmux_config else None
    tmux_target_path = tmux_config.get('target_pane') if tmux_config else None

    if tmux_layout_spec is None and tmux_target_path is not None:
        print("❌ tmux.target_pane requires tmux.layout")
        return 1

    # Start session
    if tmux_layout_spec is not None:
        try:
            start_session_with_layout(
                agent_id,
                command,
                layout_spec=tmux_layout_spec,
                target_path=tmux_target_path,
                session_layout=getattr(args, 'tmux_layout', 'sessions'),
            )
        except ValueError as e:
            print(f"❌ {e}")
            return 1
    else:
        if not start_session(agent_id, command, layout=getattr(args, 'tmux_layout', 'sessions')):
            print(f"❌ Failed to start agent '{agent_name}'")
            return 1

    session_info = get_session_info(agent_id) or {}
    session_name = session_info.get('session', f"agent-{agent_id}")
    print(f"✅ Agent '{agent_name}' started")
    print(f"   Session: {session_name}({agent_name})")
    print(f"   Working Dir: {working_dir}")
    print()

    launcher = resolve_launcher_command(agent_config.get('launcher', ''))

    # Step 1: Wait for CLI to be ready
    print(f"⏳ Waiting for CLI to be ready...")
    if not wait_for_prompt(agent_id, launcher, timeout=30):
        print(f"⚠️  Timeout waiting for CLI prompt")
        # If the underlying command exited immediately (e.g., PATH/launcher issues),
        # the tmux session may have already disappeared.
        if not session_exists(agent_id):
            print(f"❌ Agent session exited during startup")
            return 1
        if use_cli_system_prompt:
            print(f"   Continuing: system prompt injected via {system_prompt_flag}; CLI may still be starting...")
        else:
            if system_prompt:
                print(f"   System prompt not injected. Agent may still be starting...")
            return 1

    if system_prompt and not did_provider_restore:
        if use_cli_system_prompt:
            print(f"✅ CLI ready (system prompt injected via {system_prompt_flag})")
        else:
            if get_provider_key(launcher) == 'codex':
                print("❌ Codex system prompt injection is configured as CLI-only (no tmux_paste fallback)")
                return 1

            print(f"✅ CLI ready, injecting system prompt via tmux...")

            # Step 2 (fallback): Inject system prompt using tmux buffer
            if not inject_system_prompt(agent_id, system_prompt):
                print(f"❌ Failed to inject system prompt")
                return 1

            skills = agent_config.get('skills', [])
            if skills:
                print(f"   System prompt injected ({len(system_prompt)} chars, {len(skills)} skills)")
            else:
                print(f"   System prompt injected ({len(system_prompt)} chars)")
    elif system_prompt and did_provider_restore:
        print(f"ℹ️  Provider session restored; skipping system prompt injection")
    else:
        print(f"ℹ️  No system prompt configured for this agent")

    # Persist provider session id for future restores.
    if track_provider_session:
        if did_provider_restore:
            session_id = _load_provider_session_id(repo_root, provider_key, agent_id)
            if session_id:
                _save_provider_session_id(repo_root, provider_key, agent_id, session_id=session_id, cwd=working_dir)
        else:
            new_session_id = _find_new_provider_session_id_with_retry(
                provider_key,
                working_dir,
                before_paths=provider_before_sessions,
                timeout_s=2.0,
            )
            if new_session_id:
                _save_provider_session_id(repo_root, provider_key, agent_id, session_id=new_session_id, cwd=working_dir)

    # Step 3: Wait for agent to be ready
    print(f"⏳ Waiting for agent to be ready...")
    if wait_for_agent_ready(agent_id, launcher, timeout=45):
        print(f"✅ Agent is ready!")
    else:
        print(f"⚠️  Agent readiness timeout, but may still be processing...")

    # Final sanity check: ensure the session is still alive before returning success.
    if not session_exists(agent_id):
        print(f"❌ Agent session exited during startup")
        return 1

    print()
    print(f"Attach with: tmux attach -t {session_name}")
    print(f"Monitor with: python3 {Path(__file__).name} monitor {agent_file_id}")

    return 0


def cmd_stop(args):
    """Stop a running agent."""
    if not check_tmux():
        print("❌ tmux is not installed")
        return 1

    # Resolve agent
    agent_config = resolve_agent(args.agent)
    if not agent_config:
        print(f"❌ Agent not found: {args.agent}")
        return 1

    agent_name = agent_config['name']
    agent_id = get_agent_id(agent_config)

    # Check if running
    if not session_exists(agent_id):
        print(f"⚠️  Agent '{agent_name}' is not running")
        return 1

    # Stop session
    if not stop_session(agent_id):
        print(f"❌ Failed to stop agent '{agent_name}'")
        return 1

    session_name = f"agent-{agent_id}"
    print(f"✅ Agent '{agent_name}' stopped")
    print(f"   Session {session_name}({agent_name}) terminated")
    return 0


def cmd_monitor(args):
    """Monitor agent output."""
    if not check_tmux():
        print("❌ tmux is not installed")
        return 1

    # Resolve agent
    agent_config = resolve_agent(args.agent)
    if not agent_config:
        print(f"❌ Agent not found: {args.agent}")
        return 1

    agent_name = agent_config['name']
    agent_id = get_agent_id(agent_config)

    if args.follow:
        # Follow mode (like tail -f)
        session_name = f"agent-{agent_id}"
        print(f"📺 Following output for {session_name}({agent_name}) (Ctrl+C to stop)...")
        print()

        last_output = ""
        try:
            while True:
                output = capture_output(agent_id, args.lines)
                if output is None:
                    print(f"⚠️  Agent '{agent_name}' is not running")
                    return 1

                if output != last_output:
                    # Print only new content
                    if last_output:
                        new_lines = output[len(last_output):]
                        print(new_lines, end='')
                    else:
                        print(output, end='')
                    last_output = output

                time.sleep(2)
        except KeyboardInterrupt:
            print("\n\n⏹  Monitoring stopped")
    else:
        # Static snapshot
        output = capture_output(agent_id, args.lines)
        if output is None:
            print(f"⚠️  Agent '{agent_name}' is not running")
            return 1

        session_name = f"agent-{agent_id}"
        print(f"📺 Last {args.lines} lines from {session_name}({agent_name}):")
        print("=" * 60)
        print(output)
        print("=" * 60)

    return 0


def cmd_send(args):
    """Send message to agent."""
    if not check_tmux():
        print("❌ tmux is not installed")
        return 1

    # Resolve agent
    agent_config = resolve_agent(args.agent)
    if not agent_config:
        print(f"❌ Agent not found: {args.agent}")
        return 1

    agent_name = agent_config['name']
    agent_id = get_agent_id(agent_config)

    if not session_exists(agent_id):
        print(f"⚠️  Agent '{agent_name}' is not running")
        print(f"   Start with: python3 {Path(__file__).name} start {agent_config.get('file_id', agent_name)}")
        return 1

    # Send message
    if not send_keys(agent_id, args.message, send_enter=args.send_enter):
        print(f"❌ Failed to send message to {agent_name}")
        return 1

    print(f"✅ Message sent to {agent_name}")
    print(f"   Message: {args.message}")
    print()
    print(f"Monitor response: python3 {Path(__file__).name} monitor {agent_name}")
    return 0


def cmd_assign(args):
    """Assign task to agent."""
    if not check_tmux():
        print("❌ tmux is not installed")
        return 1

    # Resolve agent
    agent_config = resolve_agent(args.agent)
    if not agent_config:
        print(f"❌ Agent not found: {args.agent}")
        return 1

    agent_name = agent_config['name']
    agent_id = get_agent_id(agent_config)

    # Read task
    if args.task_file:
        try:
            with open(args.task_file, 'r') as f:
                task = f.read()
        except FileNotFoundError:
            print(f"❌ Task file not found: {args.task_file}")
            return 1
    else:
        # Read from stdin
        task = sys.stdin.read()

    if not task.strip():
        print("❌ Task cannot be empty")
        print("   Provide task via stdin or --task-file")
        return 1

    # Start agent if not running
    if not session_exists(agent_id):
        print(f"⚠️  Agent {agent_name} is not running. Starting...")

        # Build start args
        start_args = argparse.Namespace(
            agent=args.agent,
            working_dir=None
        )

        if cmd_start(start_args) != 0:
            return 1

        print()
        time.sleep(3)  # Give Claude Code time to start

    # Send task
    task_message = f"# Task Assignment\n\n{task}"
    if not send_keys(agent_id, task_message, send_enter=True):
        print(f"❌ Failed to assign task to {agent_name}")
        return 1

    print(f"✅ Task assigned to {agent_name}")
    print()
    print(f"Monitor progress: python3 {Path(__file__).name} monitor {agent_name} --follow")
    return 0


def cmd_schedule(args):
    """Handle schedule subcommands."""
    from schedule_helper import list_schedules_formatted, sync_crontab

    if args.schedule_command == 'list':
        print(list_schedules_formatted())
        return 0

    elif args.schedule_command == 'sync':
        result = sync_crontab(dry_run=args.dry_run)

        if args.dry_run:
            print("🔍 Dry run - would sync the following to crontab:")
            print()
            if result['content']:
                print(result['content'])
            else:
                print("(no schedules configured)")
            return 0

        if result['success']:
            print(f"✅ Crontab synced successfully")
            entries = result.get('entries', 0)
            added = result.get('added', 0)
            removed = result.get('removed', 0)
            print(f"   {entries} schedule entries configured")
            if added or removed:
                print(f"   Changes: +{added} -{removed}")
        else:
            print(f"❌ Failed to sync crontab")
            return 1

        return 0

    elif args.schedule_command == 'run':
        return cmd_schedule_run(args)

    else:
        print(f"Unknown schedule command: {args.schedule_command}")
        return 1


def cmd_heartbeat(args):
    """Handle heartbeat subcommands."""
    from schedule_helper import list_heartbeats_formatted, sync_crontab

    if args.heartbeat_command == 'list':
        print(list_heartbeats_formatted())
        return 0

    elif args.heartbeat_command == 'sync':
        # Reuse sync_crontab - it handles both schedules and heartbeats
        result = sync_crontab(dry_run=args.dry_run)

        if args.dry_run:
            print("🔍 Dry run - would sync the following to crontab:")
            print()
            if result['content']:
                print(result['content'])
            else:
                print("(no heartbeats configured)")
            return 0

        if result['success']:
            print(f"✅ Crontab synced successfully")
            entries = result.get('entries', 0)
            added = result.get('added', 0)
            removed = result.get('removed', 0)
            print(f"   {entries} entries configured (schedules + heartbeats)")
            if added or removed:
                print(f"   Changes: +{added} -{removed}")
        else:
            print(f"❌ Failed to sync crontab")
            return 1

        return 0

    elif args.heartbeat_command == 'run':
        return cmd_heartbeat_run(args)

    else:
        print(f"Unknown heartbeat command: {args.heartbeat_command}")
        return 1


def cmd_heartbeat_run(args):
    """Run a heartbeat check for an agent."""
    if not check_tmux():
        print("❌ tmux is not installed")
        return 1

    # Resolve agent
    agent_config = resolve_agent(args.agent)
    if not agent_config:
        print(f"❌ Agent not found: {args.agent}")
        return 1

    agent_name = agent_config['name']
    agent_id = get_agent_id(agent_config)
    agent_file_id = agent_config.get('file_id', args.agent)

    # Check if agent is disabled
    if not agent_config.get('enabled', True):
        agent_file_path = agent_config.get('_file_path', f'agents/{agent_file_id}.md')
        print(f"⏭️  Agent '{agent_name}' is disabled - skipping heartbeat")
        print(f"   Config: {agent_file_path}")
        return 0

    # Get heartbeat config
    heartbeat = agent_config.get('heartbeat')
    if not heartbeat or not isinstance(heartbeat, dict):
        print(f"❌ No heartbeat configured for agent '{agent_name}'")
        return 1

    # Check if heartbeat is disabled
    if not heartbeat.get('enabled', True):
        print(f"⏭️  Heartbeat is disabled for agent '{agent_name}'")
        return 0

    # Heartbeats only check running agents - don't start if not running
    if not session_exists(agent_id):
        print(f"⏭️  Agent '{agent_name}' is not running - skipping heartbeat")
        return 0

    # Parse timeout
    timeout_seconds = None
    timeout_str = args.timeout or heartbeat.get('max_runtime', '')
    if timeout_str:
        timeout_seconds = parse_duration(timeout_str)

    print(f"💓 Heartbeat: {agent_name}")
    print(f"   Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")

    # Standard heartbeat message
    heartbeat_message = "Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK."

    # Send heartbeat
    if not send_keys(agent_id, heartbeat_message, send_enter=True):
        print(f"❌ Failed to send heartbeat to {agent_name}")
        return 1

    print(f"✅ Heartbeat sent to {agent_name}")

    # Wait for response (if timeout specified)
    if timeout_seconds and timeout_seconds > 0:
        launcher = resolve_launcher_command(agent_config.get('launcher', ''))
        start_time = time.time()
        poll_seconds = 2

        print(f"   Waiting for response (up to {int(timeout_seconds)}s)...")
        last_state = None

        # Wait briefly for agent to start processing
        time.sleep(3)

        while (time.time() - start_time) < timeout_seconds:
            runtime = get_agent_runtime_state(agent_id, launcher=launcher)
            last_state = str(runtime.get('state', 'unknown'))

            if last_state == 'idle':
                break

            if last_state in ('blocked', 'error', 'stuck'):
                break

            time.sleep(poll_seconds)

        # Give the TUI a moment to flush output
        time.sleep(1)
        tail = capture_output(agent_id, lines=50)
        if tail:
            print("----- Agent Output (tail) -----")
            print(tail.rstrip())
            print("----- End Agent Output -----")
        else:
            print("⚠️  Could not capture agent output")

        if last_state and last_state != 'idle':
            print(f"⚠️  Agent state after wait: {last_state}")

    return 0


def cmd_schedule_run(args):
    """Run a scheduled job for an agent."""
    if not check_tmux():
        print("❌ tmux is not installed")
        return 1

    # Get schedule config
    schedule = get_agent_schedule(args.agent, args.job)
    if not schedule:
        print(f"❌ Schedule '{args.job}' not found for agent '{args.agent}'")
        return 1

    agent_config = schedule['_agent_config']
    agent_name = agent_config['name']
    agent_id = get_agent_id(agent_config)

    # Check if agent is disabled (early exit to avoid failed start attempts)
    if not agent_config.get('enabled', True):
        agent_file_id = agent_config.get('file_id', args.agent)
        agent_file_path = agent_config.get('_file_path', f'agents/{agent_file_id}.md')
        print(f"⏭️  Agent '{agent_name}' is disabled - skipping scheduled job '{args.job}'")
        print(f"   Config: {agent_file_path}")
        return 0

    # Check if schedule is disabled
    if not schedule.get('enabled', True):
        print(f"⏭️  Schedule '{args.job}' is disabled for agent '{agent_name}'")
        return 0

    # Get task content
    repo_root = get_repo_root()

    # Clean up old logs (silently, failures won't affect the scheduled job)
    removed = cleanup_old_logs(repo_root, days=7)
    if removed > 0:
        print(f"   🗑️  Cleaned up {removed} old log file(s)")

    task = get_schedule_task(schedule, repo_root)
    if not task:
        print(f"❌ No task content for schedule '{args.job}'")
        return 1

    # If the schedule points to a task file, keep a resolved path so we can reference it
    # directly (more reliable for TUIs than pasting the full content).
    schedule_task_path: Optional[Path] = None
    if not str(schedule.get('task') or '').strip():
        raw_task_file = str(schedule.get('task_file') or '').strip()
        if raw_task_file:
            raw_task_file = expand_env_vars(raw_task_file)
            path = Path(raw_task_file)
            if not path.is_absolute():
                path = repo_root / path
            if path.exists():
                schedule_task_path = path

    print(f"🚀 Running scheduled job: {agent_name}/{args.job}")
    print(f"   Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")

    # Parse timeout
    timeout_seconds = None
    timeout_str = args.timeout or schedule.get('max_runtime', '')
    if timeout_str:
        timeout_seconds = parse_duration(timeout_str)
        if timeout_seconds:
            print(f"   Max runtime: {timeout_str}")

    # Start agent if not running
    was_started = False
    if not session_exists(agent_id):
        print(f"   Starting agent...")

        start_args = argparse.Namespace(
            agent=args.agent,
            working_dir=None,
            restore=False,
        )

        if cmd_start(start_args) != 0:
            print(f"❌ Failed to start agent")
            return 1

        was_started = True
        time.sleep(2)

    # Check if agent is busy (processing previous task). For long-running stuck/error
    # states, self-heal by restarting the session so schedules don't deadlock.
    launcher = resolve_launcher_command(agent_config.get('launcher', ''))
    runtime = get_agent_runtime_state(agent_id, launcher=launcher)
    state = str(runtime.get('state', 'unknown'))
    elapsed = runtime.get('elapsed_seconds')
    did_restart = False

    def _restart_agent(reason: str) -> bool:
        nonlocal did_restart
        print(f"♻️  Restarting agent (reason: {reason})")
        stop_session(agent_id)
        time.sleep(1)
        restart_args = argparse.Namespace(agent=args.agent, working_dir=None)
        if cmd_start(restart_args) != 0:
            print("❌ Failed to restart agent")
            return False
        time.sleep(2)
        did_restart = True
        return True

    if state == 'blocked':
        # Blocked usually means the agent is waiting for user approval/input; restarting
        # would lose context and won't unblock the workflow.
        print(f"⏭️  Agent is blocked, skipping scheduled task")
        print(f"   Will retry on next cron execution")
        return 0
    if state == 'error':
        reason = str(runtime.get('reason', 'unknown'))
        if not _restart_agent(f"error:{reason}"):
            return 1
    elif state == 'stuck':
        restart_threshold = timeout_seconds if timeout_seconds else 900
        if isinstance(elapsed, int) and elapsed >= restart_threshold:
            if not _restart_agent(f"stuck>{restart_threshold}s"):
                return 1
        else:
            print(f"⏭️  Agent appears stuck but below restart threshold; skipping scheduled task")
            print(f"   Will retry on next cron execution")
            return 0
    elif state == 'busy':
        should_restart = False
        if timeout_seconds and isinstance(elapsed, int) and elapsed >= timeout_seconds:
            should_restart = True

        if should_restart:
            if not _restart_agent(f"busy>{timeout_seconds}s"):
                return 1
        else:
            # Fall back to legacy busy detection for compatibility.
            if is_agent_busy(agent_id, launcher):
                print(f"⏭️  Agent is busy, skipping scheduled task")
                print(f"   Will retry on next cron execution")
                return 0

    # Optional: clear context by restarting the session before sending the scheduled task.
    # This is intentionally "idle-only" to avoid interrupting interactive use.
    clear_context = bool(schedule.get('clear_context', False))
    if clear_context and not was_started and not did_restart:
        runtime_after = get_agent_runtime_state(agent_id, launcher=launcher)
        state_after = str(runtime_after.get('state', 'unknown'))
        if state_after == 'idle':
            if not _restart_agent('clear_context'):
                return 1

    # Wait for agent to be idle before sending the scheduled task.
    # This prevents the task from being queued with the startup prompt.
    if not was_started and not did_restart:
        idle_wait_seconds = 5
        deadline = time.time() + idle_wait_seconds
        while time.time() < deadline:
            runtime_check = get_agent_runtime_state(agent_id, launcher=launcher)
            if str(runtime_check.get('state', 'unknown')) == 'idle':
                break
            time.sleep(0.5)

    # Send the task.
    # Note: Codex TUI can be unreliable with very large multi-line pastes; prefer a file pointer.
    provider_key = get_provider_key(launcher)
    task_message = task
    if provider_key == 'codex':
        # Prefer referencing the original schedule task_file (e.g. agents/EMP_0001/prompt/team-monitor.md)
        # to avoid large multi-line pastes in the Codex TUI.
        if schedule_task_path is not None:
            task_message = (
                f"Run scheduled job '{args.job}'. Read and follow instructions from file: {schedule_task_path}"
            )
        # Fallback for inline schedules with large multi-line tasks.
        elif "\n" in task_message or len(task_message) > 2000:
            task_file = write_scheduled_task_file(repo_root, agent_id, args.job, task_message)
            task_message = (
                f"Run scheduled job '{args.job}'. Read and follow instructions from file: {task_file}"
            )

    if not send_keys(agent_id, task_message, send_enter=True):
        print(f"❌ Failed to send task to agent")
        return 1

    print(f"✅ Task sent to {agent_name}")

    # Best-effort: wait for the agent to finish and print a tail of its output.
    # Cron captures stdout/stderr to the log file, so this makes scheduled jobs
    # actually useful (they include the generated report).
    wait_seconds = timeout_seconds if timeout_seconds else 600
    if wait_seconds and wait_seconds > 0:
        start_time = time.time()
        last_state: Optional[str] = None
        poll_seconds = 2

        # First, wait briefly for the agent to actually start processing the message.
        # Some TUIs report "idle" immediately after keystroke injection.
        start_deadline = min(30, int(wait_seconds))
        while (time.time() - start_time) < start_deadline:
            runtime = get_agent_runtime_state(agent_id, launcher=launcher)
            last_state = str(runtime.get('state', 'unknown'))
            if last_state != 'idle':
                break
            time.sleep(1)

        print(f"   Waiting for completion (up to {int(wait_seconds)}s)...")
        while (time.time() - start_time) < wait_seconds:
            runtime = get_agent_runtime_state(agent_id, launcher=launcher)
            last_state = str(runtime.get('state', 'unknown'))

            if last_state == 'idle':
                break

            # If we hit a non-idle terminal state, stop waiting and log output.
            if last_state in ('blocked', 'error', 'stuck'):
                break

            time.sleep(poll_seconds)

        # Give the TUI a moment to flush output.
        time.sleep(1)
        tail = capture_output(agent_id, lines=200)
        if tail:
            print("----- Agent Output (tail) -----")
            print(tail.rstrip())
            print("----- End Agent Output -----")
        else:
            print("⚠️  Could not capture agent output")

        if last_state and last_state != 'idle':
            print(f"⚠️  Agent state after wait: {last_state}")

    # If timeout specified, wait and then stop
    if timeout_seconds and was_started:
        print(f"   Will auto-stop after {timeout_str}")
        # Note: In a real implementation, you might want to monitor
        # the agent's completion status rather than just waiting.
        # For now, we just log and let cron handle the next invocation.

    return 0


def main():
    parser = argparse.ArgumentParser(
        description="Agent Manager - Manage employee agents via tmux",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s list                          List all agents
  %(prog)s start dev                     Start dev agent (session: agent-emp-0001)
  %(prog)s start dev --tmux-layout windows  Start dev agent in a shared tmux session
  %(prog)s start dev --working-dir /path  Start with custom working dir
  %(prog)s stop dev                      Stop dev agent
  %(prog)s monitor dev --follow          Monitor dev output (live)
  %(prog)s send dev "hello"              Send message to dev
  %(prog)s assign dev <<EOF              Assign task to dev
  Fix the bug
  EOF
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # list command
    list_parser = subparsers.add_parser('list', help='List all agents')
    list_parser.add_argument('--running', '-r', action='store_true',
                            help='Show only running agents')

    # start command
    start_parser = subparsers.add_parser('start', help='Start an agent')
    start_parser.add_argument('agent', help='Agent name (e.g., dev, qa) or file ID (e.g., EMP_0001)')
    start_parser.add_argument('--working-dir', '-w', help='Override working directory')
    start_parser.add_argument(
        '--tmux-layout',
        choices=['sessions', 'windows'],
        default='sessions',
        help="tmux layout: 'sessions' (default, one session per agent) or 'windows' (single shared session with one window per agent)",
    )
    start_restore_group = start_parser.add_mutually_exclusive_group()
    start_restore_group.add_argument(
        '--restore',
        '-r',
        action='store_true',
        default=True,
        help='Restore/reuse the existing tmux session if it already exists (default)'
    )
    start_restore_group.add_argument(
        '--no-restore',
        dest='restore',
        action='store_false',
        help='Fail if the tmux session already exists'
    )

    # stop command
    stop_parser = subparsers.add_parser('stop', help='Stop a running agent')
    stop_parser.add_argument('agent', help='Agent name')

    # monitor command
    monitor_parser = subparsers.add_parser('monitor', help='Monitor agent output')
    monitor_parser.add_argument('agent', help='Agent name')
    monitor_parser.add_argument('--follow', '-f', action='store_true',
                               help='Follow output (like tail -f)')
    monitor_parser.add_argument('--lines', '-n', type=int, default=100,
                               help='Number of lines to show (default: 100)')

    # send command
    send_parser = subparsers.add_parser('send', help='Send message to agent')
    send_parser.add_argument('agent', help='Agent name')
    send_parser.add_argument(
        '--send-enter',
        dest='send_enter',
        action='store_true',
        default=True,
        help='Send Enter after message (default)'
    )
    send_parser.add_argument(
        '--no-enter',
        dest='send_enter',
        action='store_false',
        default=True,
        help='Do not send Enter after message (message will be typed but not submitted)'
    )
    send_parser.add_argument('message', help='Message to send')

    # assign command
    assign_parser = subparsers.add_parser('assign', help='Assign task to agent')
    assign_parser.add_argument('agent', help='Agent name')
    assign_parser.add_argument('--task-file', '-f', help='Read task from file')

    # schedule command with subcommands
    schedule_parser = subparsers.add_parser('schedule', help='Manage scheduled jobs')
    schedule_subparsers = schedule_parser.add_subparsers(dest='schedule_command', help='Schedule commands')

    # doctor command
    doctor_parser = subparsers.add_parser('doctor', help='Check environment and configuration')
    doctor_parser.add_argument('--deep', action='store_true', help='Perform deeper checks')

    # schedule list
    schedule_list_parser = schedule_subparsers.add_parser('list', help='List all scheduled jobs')

    # schedule sync
    schedule_sync_parser = schedule_subparsers.add_parser('sync', help='Sync schedules to crontab')
    schedule_sync_parser.add_argument('--dry-run', '-n', action='store_true',
                                      help='Show what would be synced without making changes')

    # schedule run
    schedule_run_parser = schedule_subparsers.add_parser('run', help='Run a scheduled job manually')
    schedule_run_parser.add_argument('agent', help='Agent name')
    schedule_run_parser.add_argument('--job', '-j', required=True, help='Job name to run')
    schedule_run_parser.add_argument('--timeout', '-t', help='Override max runtime (e.g., 30m, 2h)')

    # heartbeat command with subcommands
    heartbeat_parser = subparsers.add_parser('heartbeat', help='Manage heartbeat jobs')
    heartbeat_subparsers = heartbeat_parser.add_subparsers(dest='heartbeat_command', help='Heartbeat commands')

    # heartbeat list
    heartbeat_list_parser = heartbeat_subparsers.add_parser('list', help='List all heartbeat jobs')

    # heartbeat sync (reuses crontab sync)
    heartbeat_sync_parser = heartbeat_subparsers.add_parser('sync', help='Sync heartbeats to crontab')
    heartbeat_sync_parser.add_argument('--dry-run', '-n', action='store_true',
                                       help='Show what would be synced without making changes')

    # heartbeat run
    heartbeat_run_parser = heartbeat_subparsers.add_parser('run', help='Run a heartbeat manually')
    heartbeat_run_parser.add_argument('agent', help='Agent name or file ID')
    heartbeat_run_parser.add_argument('--timeout', '-t', help='Override max runtime (e.g., 30m, 2h)')

    args = parser.parse_args()

    # Show help if no command
    if not args.command:
        parser.print_help()
        return 0

    # Route to appropriate handler
    handlers = {
        'list': cmd_list,
        'doctor': cmd_doctor,
        'start': cmd_start,
        'stop': cmd_stop,
        'monitor': cmd_monitor,
        'send': cmd_send,
        'assign': cmd_assign,
        'schedule': cmd_schedule,
        'heartbeat': cmd_heartbeat,
    }

    handler = handlers.get(args.command)
    if handler:
        return handler(args)

    parser.print_help()
    return 1


if __name__ == '__main__':
    try:
        sys.exit(main())
    except BrokenPipeError:
        # Allow piping to tools like `head` without dumping a stack trace.
        try:
            sys.stdout.close()
        finally:
            sys.exit(0)
