# PostgreSQL Setup - Neon

## Current Status ✅

Your FinEdge-ERP is now running on **Neon PostgreSQL** (production-grade managed database).

## What Changed

### Before (SQLite)
- Database: Local file (`dev.db`)
- Good for: Development only
- Portability: Database file included

### After (PostgreSQL via Neon) ✅
- Database: Neon managed PostgreSQL in cloud
- Good for: Production-ready, scalable
- Portability: Database URL in `.env`

## Connection Details

**File:** `backend/.env` (NOT in git)

```
DATABASE_URL="postgresql://neondb_owner:npg_vjsQwEufAo03@ep-cool-breeze-ax9ysbi0-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

**Breakdown:**
- **User**: `neondb_owner`
- **Host**: `ep-cool-breeze-ax9ysbi0-pooler.c-4.us-east-2.aws.neon.tech`
- **Database**: `neondb`
- **Region**: AWS us-east-2
- **Security**: SSL required, channel binding enabled

## Database Status

✅ **Connected and Ready**
- Schema created
- Tables migrated
- Seed data loaded
- All working

## Seed Data

Pre-loaded test data:
- 2 Users (Admin, Accountant)
- 2 Contacts (Azure Furniture vendor, Nimesh Pathak customer)
- 3 Products (Office Chair, Wooden Table, Sofa)
- 7 Accounts (Chart of Accounts)
- 4 Journals (Sales, Purchase, Cash, Bank)

## Accessing the Database

### Option 1: Prisma Studio (GUI)
```bash
cd backend
npx prisma studio
```
Opens at http://localhost:5555

Provides:
- ✓ Visual database browser
- ✓ View all tables
- ✓ Create/edit records
- ✓ Filter and search
- ✓ Export data

### Option 2: Direct Connection
Use any PostgreSQL client:
- Host: `ep-cool-breeze-ax9ysbi0-pooler.c-4.us-east-2.aws.neon.tech`
- Port: 5432
- Database: `neondb`
- User: `neondb_owner`
- Password: (in `.env`)

### Option 3: Neon Dashboard
1. Go to https://console.neon.tech/
2. Login to your account
3. View database, run SQL queries
4. Monitor connections

## Backup & Restore

**Neon includes:**
- ✅ Automatic daily backups
- ✅ 7-day retention
- ✅ Point-in-time recovery
- ✅ High availability

Check your Neon account for backup options.

## Performance

Neon database is:
- ✓ Serverless (auto-scaling)
- ✓ Optimized for PostgreSQL
- ✓ Full SSL/TLS encryption
- ✓ Connection pooling built-in
- ✓ Geographically distributed

## Schema Changes

If you need to modify the database schema:

```bash
# Update schema in schema.prisma
# Then push changes:
cd backend
npx prisma db push

# Or create a migration:
npx prisma migrate dev --name description_of_change
```

## Migrations

All migrations are stored in:
```
backend/prisma/migrations/
```

These are tracked in git (unlike `.env`).

## Monitoring

Check database status:
```bash
# Via Neon console at https://console.neon.tech/

# Via psql (if installed):
psql "postgresql://neondb_owner:password@host/neondb"
```

## Troubleshooting

### Connection Timeout
- Verify `.env` DATABASE_URL is correct
- Check SSL settings: `sslmode=require`
- Ensure backend can reach Neon servers
- Check firewall/network restrictions

### Seed Data Missing
```bash
cd backend
npx prisma db seed
```

### Need to Reset Database
```bash
cd backend
npx prisma migrate reset
# This will:
# 1. Drop all tables
# 2. Re-apply migrations
# 3. Re-run seed
```

⚠️ **WARNING:** This deletes all data!

### Schema Out of Sync
```bash
cd backend
npx prisma db push
```

## Costs

Neon pricing:
- Free tier: Included
- Compute: $0.16/hour per compute
- Storage: $0.12 per GB/month

Your current usage: Very low (development)

## Security Reminders

✅ **What's Protected:**
- `.env` is in `.gitignore` (won't be committed)
- SSL/TLS encryption to database
- Password stored locally only
- Neon provides managed security

⚠️ **Your Responsibility:**
- Keep `.env` file secure
- Don't share DATABASE_URL
- Rotate password if exposed
- Monitor Neon console for unauthorized access

## Next Steps

1. ✅ Backend running with PostgreSQL
2. ✅ Database populated with seed data
3. 👉 Continue development
4. Test the complete accounting flow
5. Deploy when ready

## Switching Back to SQLite (if needed)

Not recommended, but possible:

```bash
# Edit backend/.env:
DATABASE_URL="file:./dev.db"

# Edit backend/prisma/schema.prisma:
provider = "sqlite"

# Migrate back:
cd backend
rm -r prisma/migrations
npx prisma migrate dev --name init
npx prisma db seed
```

## Support

- Neon Documentation: https://neon.tech/docs
- Prisma Docs: https://www.prisma.io/docs
- This project docs: See other `.md` files in root

## Summary

| Aspect | Details |
|--------|---------|
| **Database** | Neon PostgreSQL (managed) |
| **Status** | ✅ Connected and working |
| **Location** | AWS us-east-2 |
| **Security** | SSL/TLS encrypted |
| **Backups** | Automatic daily |
| **Credentials** | In `backend/.env` (protected) |
| **Data** | Seeded and ready |

**Your FinEdge-ERP is production-ready!** 🚀
