# Development Guide

## Prerequisites

- Node.js 16 or later
- Docker and Docker Compose
- OpenAI API key
- Discord Bot token

## Setup Development Environment

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials
3. Install dependencies:
   ```bash
   npm install
   ```

## Development Workflow

The project uses a devfile-based workflow. Here are the main commands:

### Building
```bash
npm run build:bot
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Running in Development Mode
```bash
npm run dev
```

### Debug Mode
```bash
npm run dev -- --inspect
```

## Testing Strategy

- Unit tests are in `__tests__` directories
- Integration tests are in `tests/integration`
- E2E tests are in `tests/e2e`

Run specific test suites:
```bash
npm test -- --testPathPattern=unit
npm test -- --testPathPattern=integration
npm test -- --testPathPattern=e2e
```

## Continuous Integration

The project uses GitHub Actions for CI/CD. See `.github/workflows` for the pipeline configuration.