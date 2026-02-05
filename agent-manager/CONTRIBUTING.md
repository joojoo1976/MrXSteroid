# Contributing to Agent Manager

Thank you for your interest in contributing to Agent Manager! This document provides guidelines and instructions for contributing to the project.

## 📋 How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find that the problem has already been reported. When creating a bug report, please include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs. actual behavior
- Environment details (OS, Python version, tmux version)
- Any relevant logs or error messages

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:

- Use a clear and descriptive title
- Provide a detailed explanation of the suggested enhancement
- Explain why this enhancement would be useful
- Provide examples if applicable

### Pull Requests

Pull requests are welcome! To ensure your PR is accepted:

1. Fork the repository
2. Create a new branch for your feature (`git checkout -b feature/amazing-feature`)
3. Make your changes and write clear commit messages
4. Ensure your code follows the existing style
5. Add tests if applicable
6. Update documentation as needed
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 🛠️ Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/agent-manager-skill.git
cd agent-manager-skill

# Create a virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run the script directly
python3 agent-manager/scripts/main.py doctor
```

## 📝 Coding Standards

- Follow PEP 8 for Python code
- Write clear, descriptive variable and function names
- Add docstrings for functions and classes
- Keep functions small and focused

## 🧪 Testing

Before submitting a PR, ensure:

- The code works as expected
- No new linting errors are introduced
- Changes are well-tested

## 📖 Documentation

- Keep documentation up-to-date
- Add docstrings to new functions
- Update README if needed
- Document any breaking changes

## 💬 Communication

- Be respectful and constructive
- Ask questions if anything is unclear
- Participate in discussions on issues and PRs

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
