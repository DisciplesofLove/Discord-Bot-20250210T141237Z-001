# Backups Directory

This directory contains automated backups of:
- Database dumps
- Configuration files
- Command stats and metrics
- User data (if applicable)

## Structure

```
backups/
├── database/           # Database dumps
├── config/            # Configuration backups
├── metrics/           # Command usage metrics
└── user-data/         # User data backups (if applicable)
```

## Retention Policy

- Daily backups: Retained for 7 days
- Weekly backups: Retained for 4 weeks
- Monthly backups: Retained for 12 months
- Yearly backups: Retained for 5 years

## Backup Schedule

- Database: Daily at 00:00 UTC
- Configuration: On every change
- Metrics: Hourly
- User data: Daily at 01:00 UTC

## Recovery Procedures

1. Database Recovery:
```bash
npm run backup:restore --type=database --date=YYYY-MM-DD
```

2. Configuration Recovery:
```bash
npm run backup:restore --type=config --date=YYYY-MM-DD
```

3. User Data Recovery:
```bash
npm run backup:restore --type=user-data --date=YYYY-MM-DD
```

## Verification

All backups are automatically verified after creation. The verification status is logged in `logs/backup-verification.log`.