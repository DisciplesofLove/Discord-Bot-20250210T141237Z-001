# Development Guide

## Setup
1. Install dependencies:
```bash
npm install
```

2. Environment Setup:
```bash
cp .env.example .env
# Edit .env with your Discord bot token and other required variables
```

3. Start Development Server:
```bash
npm run dev
```

## Project Structure
- `Discord Bot/bot.js`: Main bot implementation
- `Discord Bot/commands/`: Command implementations
- `Discord Bot/backend/src/services/`: Core services

## Available Scripts
- `npm run dev`: Start development server with hot reload
- `npm test`: Run tests
- `npm run lint`: Check code style
- `npm run format`: Format code

## Testing
Run different test suites:
```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Deployment
1. Build:
```bash
npm run build
```

2. Deploy:
```bash
npm run deploy
```

## Monitoring
Monitor bot health:
```bash
npm run monitor
```

## Debug Tips
1. Check logs for errors
2. Verify environment variables
3. Test commands individually
4. Monitor service connections

## Common Issues
1. Token Issues:
   - Verify DISCORD_TOKEN in .env
   - Check bot permissions

2. Command Not Found:
   - Verify command registration
   - Check command file path

3. Service Connection Issues:
   - Check service endpoints
   - Verify credentials