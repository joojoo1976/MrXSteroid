# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| Latest  | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

### How to Report

Please send an email to **yubing744@gmail.com** with:

- A description of the vulnerability
- Steps to reproduce the issue
- Any potential impact or exploit scenario
- If applicable, a proposed fix or mitigation

### What to Expect

- We will acknowledge receipt of your report within 48 hours
- We will provide a detailed response within 7 days indicating the next steps
- You will receive credit for your discovery (unless you prefer to remain anonymous)

### Guidelines

- Please do not disclose security vulnerabilities publicly until they have been fixed
- Give us reasonable time to investigate and address the issue
- We appreciate your help in keeping this project secure!

## Security Best Practices

When using Agent Manager, consider the following:

- **File Permissions**: Ensure proper file permissions on agent configuration files
- **Agent Scripts**: Review agent scripts before running them in production
- **Cron Jobs**: Be aware of what commands are scheduled in crontab
- **Sensitive Data**: Avoid storing sensitive information in agent configuration files
- **Dependencies**: Keep dependencies updated and review them regularly

## Dependency Security

This project uses minimal dependencies:
- `python3` (standard library only)
- `tmux`

We recommend:
- Keeping your Python installation updated
- Using the latest stable version of tmux
- Regularly checking for security updates in your operating system

## Private Information

Never commit the following to the repository:
- API keys or tokens
- Passwords or credentials
- Personal information
- Private keys or certificates

Use environment variables or secure configuration files for sensitive data.
