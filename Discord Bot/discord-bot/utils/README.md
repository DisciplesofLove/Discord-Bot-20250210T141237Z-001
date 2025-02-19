# Error Handling Documentation

## Error Categories

The error handler categorizes errors into three types:

1. **Operational Errors** (default)
   - Rate limiting
   - Circuit breaker triggers
   - Permission issues
   - Expected application errors

2. **External Errors**
   - API failures
   - Third-party service issues
   - Network problems

3. **Programming Errors**
   - Unhandled exceptions
   - Syntax errors
   - Undefined references
   - Other unexpected errors

## Error Reporting

- Operational errors are logged but not sent to Sentry
- External and programming errors are logged and sent to Sentry
- All errors provide user-friendly messages via Discord

## Environment Variables

Required environment variables:
- `SENTRY_DSN`: Sentry Data Source Name
- `NODE_ENV`: Environment name (development/production)