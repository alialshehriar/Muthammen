# Environment Variables Setup for Vercel

## Required Environment Variables:

### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_UtXigzdkJ97e@ep-shy-silence-a1s6qwpo-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### 2. ADMIN_API_KEY
```
mothammen2025admin
```

## How to Add in Vercel:

1. Go to: https://vercel.com/alialshehriars-projects/mothammen-complete/settings/environment-variables

2. Add DATABASE_URL:
   - Key: `DATABASE_URL`
   - Value: (copy from above)
   - Environments: Production, Preview, Development

3. Add ADMIN_API_KEY:
   - Key: `ADMIN_API_KEY`
   - Value: `mothammen2025admin`
   - Environments: Production

4. Redeploy the application

## Database Schema:

Already executed on Neon database successfully! ✅

All tables, triggers, and views are ready.

## Admin Dashboard Access:

URL: https://mothammen-complete.vercel.app/admin
API Key: mothammen2025admin

## Domain Setup (Optional):

To connect muthammen.com domain:

### Option 1: Via Vercel Dashboard
1. Go to: https://vercel.com/alialshehriars-projects/mothammen-complete/settings/domains
2. Click "Add"
3. Enter: muthammen.com
4. Follow DNS instructions

### Option 2: Via Cloudflare
1. In Cloudflare, go to DNS → Records
2. Add A record:
   - Type: A
   - Name: @
   - IPv4: 76.76.21.21
   - Proxy: ON
3. Add CNAME record:
   - Type: CNAME
   - Name: www
   - Target: cname.vercel-dns.com
   - Proxy: ON

## Current Status:

✅ Database: Connected and ready
✅ Schema: Executed successfully
✅ Application: Built and ready to deploy
⏳ Environment Variables: Need to be added in Vercel dashboard
⏳ Domain: Can be connected after env vars are set

## Next Steps:

1. Add environment variables in Vercel (see instructions above)
2. Redeploy the application
3. Test at: https://mothammen-complete.vercel.app
4. Access admin at: https://mothammen-complete.vercel.app/admin
5. (Optional) Connect custom domain

