# Automated Tasks

This directory contains automated tasks and cron jobs for system maintenance and monitoring.

## Current Tasks

1. **Health Checks** (Every 5 minutes)
- Checks Redis, Elasticsearch, and RabbitMQ health
- Logs any issues found
- Triggers alerts for unhealthy services

2. **Cache Cleanup** (Daily at midnight)
- Removes expired cache entries
- Maintains optimal cache performance
- Logs cleanup results

3. **Log Rotation** (Weekly on Sunday)
- Rotates log files
- Compresses old logs
- Moves logs to cold storage

## Adding New Tasks

1. Create a new function in `cron.js` or a new file
2. Use node-cron syntax for scheduling
3. Include proper error handling
4. Add logging for monitoring
5. Update this README

## Cron Syntax

```
* * * * * *
| | | | | |
| | | | | day of week (0-7)
| | | | month (1-12)
| | | day of month (1-31)
| | hour (0-23)
| minute (0-59)
second (0-59, optional)
```

Example: `0 0 * * *` = Daily at midnight

## Monitoring

All automated tasks are logged to:
- `logs/automation.log` for general logs
- `logs/error.log` for errors

## Error Handling

All tasks include:
1. Try-catch blocks
2. Error logging
3. Retry mechanisms where appropriate
4. Alert notifications for critical failures