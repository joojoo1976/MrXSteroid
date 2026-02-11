# Contributing to Mr. X Steroid Application

Thank you for considering contributing to the Mr. X Steroid application! This document outlines the guidelines and best practices for contributing to the project.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Style](#code-style)
4. [Testing](#testing)
5. [Documentation](#documentation)
6. [Pull Requests](#pull-requests)
7. [Issue Reporting](#issue-reporting)
8. [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Git version control system
- Basic understanding of React, TypeScript, and Supabase

### Setting Up Your Development Environment
1. Fork the repository on GitHub
2. Clone your forked repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/MrXSteroid.git
   cd MrXSteroid
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
5. Set up your environment variables
6. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Strategy
- Create a new branch for each feature or bug fix
- Use descriptive branch names (e.g., `feature/user-authentication`, `bugfix/login-error`)
- Keep branches focused on a single issue or feature
- Regularly pull from the main branch to stay up-to-date

### Creating a Branch
```bash
git checkout -b feature/my-new-feature
# or
git checkout -b bugfix/issue-fix
```

### Making Changes
1. Make your changes in the new branch
2. Write or update tests as needed
3. Update documentation if necessary
4. Run tests to ensure everything works
5. Commit your changes with a descriptive message

## Code Style

### TypeScript Guidelines
- Use TypeScript for all new code
- Write clear, descriptive type definitions
- Use interfaces over types when possible
- Follow naming conventions (PascalCase for types, camelCase for variables)
- Use strict null checks (`strictNullChecks: true`)

### React Component Guidelines
- Use functional components with hooks
- Keep components focused and single-purpose
- Use TypeScript interfaces for props
- Implement proper error boundaries
- Follow accessibility best practices

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Functions**: camelCase (e.g., `calculateBMI`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Interfaces**: PascalCase prefixed with I if needed (e.g., `UserInterface`)
- **Utility Files**: kebab-case (e.g., `date-utils.ts`)

### File Structure
- Organize files by feature/domain
- Keep related files together
- Use index files to export from directories
- Separate types and interfaces appropriately

### Code Formatting
- Use Prettier for consistent formatting
- Follow the existing code style in the project
- Write clear, concise comments
- Document complex logic thoroughly

## Testing

### Writing Tests
- Write unit tests for all new functions and components
- Test edge cases and error conditions
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Mock external dependencies when appropriate

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
```typescript
describe('ComponentName', () => {
  it('should perform action when condition', () => {
    // Arrange
    const props = {};
    
    // Act
    const result = functionUnderTest(props);
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

## Documentation

### Code Comments
- Write clear, concise comments explaining complex logic
- Use JSDoc for public functions and classes
- Update comments when changing functionality
- Avoid redundant comments that just repeat the code

### Inline Documentation
```typescript
/**
 * Calculates the Body Mass Index (BMI) for a given weight and height
 * @param weight Weight in kilograms
 * @param height Height in centimeters
 * @returns BMI value as a number
 * @throws Error if height is zero or negative
 */
function calculateBMI(weight: number, height: number): number {
  // Implementation
}
```

### Updating Documentation
- Update README.md if adding new features
- Update DOCUMENTATION.md for architectural changes
- Add comments to explain new functionality
- Update example code if changing APIs

## Pull Requests

### Before Submitting
- Ensure all tests pass
- Verify your code follows the style guidelines
- Update documentation as needed
- Squash commits if necessary
- Write a clear, descriptive PR title and description

### Pull Request Template
When creating a pull request, please follow this template:

```
## Description
Brief description of changes made

## Related Issue
Closes #[issue-number]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing performed

## Screenshots (if applicable)
Insert screenshots here if UI changes were made
```

### Review Process
- PRs require at least one approval before merging
- Address all review comments before merging
- Keep PRs small and focused
- Be responsive to feedback

## Issue Reporting

### Good Bug Reports
- Use a clear, descriptive title
- Describe the expected behavior
- Describe the actual behavior
- Include steps to reproduce
- Mention the environment (OS, browser, version)
- Include relevant screenshots or error messages

### Feature Requests
- Explain the problem you're trying to solve
- Describe your proposed solution
- Consider alternative solutions
- Explain why this feature would benefit the project

## Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Be patient with newcomers
- Focus on the code, not the person
- Welcome diverse perspectives

### Getting Help
- Check existing documentation first
- Search for similar issues
- Ask questions in a respectful manner
- Provide context when asking for help

### Recognition
- Contributors will be recognized in release notes
- Major contributions may be highlighted in project communications
- All contributions help improve the project for everyone

## Additional Resources

- [Project Documentation](DOCUMENTATION.md)
- [API Reference](src/types/)
- [Example Implementations](src/components/)
- [Testing Framework](src/testing/)

---

Thank you for contributing to the Mr. X Steroid application! Your efforts help make this project better for everyone.