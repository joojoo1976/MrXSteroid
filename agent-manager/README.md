# Agent Manager (agent-manager)

Simple, installation-agnostic agent lifecycle management using **tmux + Python**.

Manage multiple AI agents without running a server, wiring HTTP APIs, or pulling in heavy dependencies.

![agent-manager demo](assets/demo.svg)

## Why agent-manager?

Managing multiple AI agents is deceptively complex:

- Each agent needs its own long-running process
- You need a reliable way to start/stop/monitor them
- Scheduling (cron) should keep working even if you move the skill around

**agent-manager** solves this with a tiny architecture: **tmux sessions + a single Python CLI**.

**Advantages:**

- **Zero dependencies** beyond `tmux` + `python3`
- **Cross-platform** (where tmux runs)
- **Cron-friendly**: `schedule sync` writes crontab entries calling the installed `main.py` by absolute path

## Highlights

- 🚀 Simple agent lifecycle management
- 📅 Scheduled task execution via cron
- 🔧 Installation-agnostic design
- 🎯 Zero dependencies beyond tmux + Python

## Installation

### via openskills (recommended)

```bash
# Project installation
openskills install fractalmind-ai/agent-manager-skill

# Global installation
openskills install fractalmind-ai/agent-manager-skill --global
```

### Manual installation

```bash
git clone https://github.com/fractalmind-ai/agent-manager-skill.git
cd agent-manager-skill
cp -r agent-manager ~/.claude/skills/agent-manager
```

## Usage

After installation, read the skill documentation:

```bash
openskills read agent-manager
```

Or view directly:

```bash
cat ~/.claude/skills/agent-manager/SKILL.md
```

## Quick Start

```bash
# From your repository root (where `agents/` lives)
cd your-project

# If installed (project-local; path varies by tool):
python3 .agent/skills/agent-manager/scripts/main.py list
# (or, if you use `.claude/skills/` instead of `.agent/skills/`)
python3 .claude/skills/agent-manager/scripts/main.py list

# If installed (global):
python3 ~/.claude/skills/agent-manager/scripts/main.py list
# (or, if you use `~/.agent/skills/` instead of `~/.claude/skills/`)
python3 ~/.agent/skills/agent-manager/scripts/main.py list

# Sanity check your setup
# (use the same install path as above; replace `.agent/skills/` with `.claude/skills/` if needed)
python3 .agent/skills/agent-manager/scripts/main.py doctor

# Start / monitor / stop
# (same note: replace `.agent/skills/` with `.claude/skills/` if needed)
python3 .agent/skills/agent-manager/scripts/main.py start EMP_0001
python3 .agent/skills/agent-manager/scripts/main.py monitor EMP_0001 --follow
python3 .agent/skills/agent-manager/scripts/main.py stop EMP_0001

# Optional: keep all agents in one shared tmux session (tabs/windows)
python3 .agent/skills/agent-manager/scripts/main.py start EMP_0001 --tmux-layout windows
tmux attach -t agent-manager
# (Optional) Customize the shared session name via: $AGENT_MANAGER_TMUX_GROUP_SESSION

# If you want to run the CLI from a cloned copy of this repo:
REPO_ROOT="$PWD/your-project" python3 agent-manager/scripts/main.py doctor
```

## Getting Started

See `examples/getting-started.md` for a 2-minute end-to-end walkthrough.

## Demo

The screenshot above shows a real run of:

- `list` (see configured agents + status)
- `start` (launches an agent into `tmux`)
- `monitor` (captures output from the tmux pane)
- `stop` (kills the agent's tmux session)

Want an animated GIF instead? You can record it with tools like `termttogif` (or any terminal recorder) and replace `assets/demo.svg`.

## Path & Repo Root Resolution

- Repo root is resolved in this priority order: `$REPO_ROOT` → git superproject (submodule-safe) → git toplevel → parent-walk fallback.
- `schedule sync` writes crontab entries that call the *installed* `main.py` absolute path (so cron keeps working regardless of where the skill is installed).

## Skills Resolution

When injecting agent skills into the system prompt, `agent-manager` searches for `SKILL.md` in the following locations (first match wins):

1) `<repo>/.agent/skills/<skill>/SKILL.md`
2) `~/.agent/skills/<skill>/SKILL.md`
3) `<repo>/.claude/skills/<skill>/SKILL.md`
4) `~/.claude/skills/<skill>/SKILL.md`

## Documentation

See [agent-manager/SKILL.md](agent-manager/SKILL.md) for complete documentation.

## Requirements

- Python 3.x
- tmux
- Agents defined under `agents/` (supports `agents/EMP_0001.md` and `agents/EMP_0001/AGENTS.md`)

## Codex Launcher Notes

When using `launcher: codex` with cron schedules, `agent-manager` will best-effort auto-dismiss Codex's first-run/upgrade model selection prompt to keep scheduled jobs non-interactive.

## Features

- 🚀 Simple agent lifecycle management (start/stop/monitor)
- 📅 Scheduled task execution via cron (`schedule list`, `schedule sync`, `schedule run`)
- 🔧 Installation-agnostic (works from any location)
- 🎯 Zero dependencies beyond tmux + Python
- 💡 Dynamic path resolution (submodule-safe repo root detection)

## License

MIT
