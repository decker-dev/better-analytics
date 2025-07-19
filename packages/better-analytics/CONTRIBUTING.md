# Contributing to Better Analytics

Thank you for your interest in contributing to Better Analytics! We welcome contributions from the community and are grateful for any help you can provide.

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Basic knowledge of TypeScript/JavaScript

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/better-analytics.git
   cd better-analytics
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development**
   ```bash
   # Build and watch the SDK
   cd packages/better-analytics
   pnpm dev

   # Or run all packages
   cd ../../
   pnpm dev
   ```

4. **Run tests**
   ```bash
   cd packages/better-analytics
   pnpm test
   ```

## How to Contribute

### Reporting Issues

Before creating a new issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use our issue templates** when available
3. **Provide clear reproduction steps** with minimal examples
4. **Include relevant environment information** (Node.js version, framework, etc.)

### Submitting Pull Requests

1. **Create a new branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, concise code
   - Add tests for new functionality
   - Update documentation if needed
   - Follow existing code style

3. **Test your changes**
   ```bash
   pnpm test
   pnpm lint
   pnpm check-types
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add support for custom events"
   git commit -m "fix: resolve session timeout issue"
   git commit -m "docs: update installation instructions"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### What We're Looking For

**High Priority:**
- Bug fixes
- Performance improvements
- Better TypeScript types
- Framework integrations (Svelte, Vue, etc.)
- Test coverage improvements

**Medium Priority:**
- Documentation improvements
- Example applications
- Developer experience enhancements

**Low Priority:**
- Major API changes (please discuss first)
- Breaking changes

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing patterns and conventions
- Write self-documenting code with clear variable names
- Add JSDoc comments for public APIs

### Testing

- Write tests for new features
- Maintain or improve test coverage
- Test across different environments (Node.js, browsers, frameworks)
- Use descriptive test names

### Documentation

- Update README.md if needed
- Add TypeScript types and JSDoc comments
- Include examples for new features
- Keep documentation concise and clear

## Project Structure

```
packages/better-analytics/
├── src/
│   ├── index.ts          # Core SDK
│   ├── next/             # Next.js integration
│   ├── expo.ts           # Expo/React Native
│   ├── server.ts         # Server-side tracking
│   └── __tests__/        # Test files
├── dist/                 # Built files
└── package.json
```

## Questions?

- **General questions:** [GitHub Issues](https://github.com/decker-dev/better-analytics/issues)
- **Private inquiries:** [hello@better-analytics.app](mailto:hello@better-analytics.app)
- **Documentation:** [docs.better-analytics.app](https://docs.better-analytics.app)

## License

By contributing to Better Analytics, you agree that your contributions will be licensed under the [MIT License](./LICENSE). 