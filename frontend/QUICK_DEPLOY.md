# 🚀 Quick Deployment Guide

## Current Status ✅
- Supabase project created: `btgfxzycmashqxtmxqfo`
- API keys configured
- Project prepared for deployment

## Next Steps:

### 1. Complete Database Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/btgfxzycmashqxtmxqfo/settings/database)
2. Find your database password or create a new one
3. Update `DATABASE_URL` and `DIRECT_URL` in `.env.local` by replacing `[YOUR-DATABASE-PASSWORD]`

### 2. Test Locally
```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

### 3. Deploy to Vercel
1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Configure Supabase"
   git push origin main
   ```

2. Import to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env.vercel`

3. Update production URLs:
   - Replace `https://your-app.vercel.app` with your actual Vercel URL
   - Update `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL`

### 4. Post-Deployment
1. Visit: `https://your-app.vercel.app/api/admin/setup`
2. Test admin login: `https://your-app.vercel.app/admin/login`

## Environment Variables for Vercel:
Copy these from `.env.vercel` to Vercel Dashboard → Settings → Environment Variables

## Benefits of This Setup:
✅ **Fast Performance**: Supabase PostgreSQL  
✅ **Reliable**: 99.9% uptime  
✅ **Scalable**: Auto-scaling database  
✅ **Free Tier**: 500MB storage  
✅ **Real-time**: Built-in subscriptions  

## Support:
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Project Dashboard: https://supabase.com/dashboard/project/btgfxzycmashqxtmxqfo
