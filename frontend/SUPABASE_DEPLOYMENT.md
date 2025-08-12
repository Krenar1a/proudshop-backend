# 🚀 Guide për Deployment në Vercel me Supabase

## Hapat për Setup të Supabase

### 1. Krijoni Account në Supabase
1. Shkoni në [supabase.com](https://supabase.com)
2. Regjistrohuni me GitHub account
3. Krijoni projekt të ri

### 2. Merrni Database Connection
1. Në Supabase Dashboard → Settings → Database
2. Copy Connection String:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
3. Zëvendësoni `[YOUR-PASSWORD]` me password që vendosët

### 3. Environment Variables për Vercel
```env
# Database - Supabase
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# NextAuth
NEXTAUTH_SECRET=your-super-secret-32-character-string
NEXTAUTH_URL=https://your-app.vercel.app

# Admin
ADMIN_EMAIL=admin@proudshop.com
ADMIN_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-jwt-secret-key

# Base URL
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

## Deployment në Vercel

### 1. Push në GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment with Supabase"
git push origin main
```

### 2. Connect me Vercel
1. Shkoni në [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Add environment variables
4. Deploy!

### 3. Post-Deployment
1. Vizitoni: `https://your-app.vercel.app/api/admin/setup`
2. Test admin login: `https://your-app.vercel.app/admin/login`

## Përfitimet e Supabase

✅ **Performance**: 5-10x më i shpejtë se MongoDB
✅ **Reliability**: 99.9% uptime
✅ **Scalability**: Auto-scaling
✅ **Features**: Real-time, Auth, Storage
✅ **Cost**: Falas deri 500MB
✅ **Prisma Support**: Perfect integration

## Troubleshooting

### Database Connection Issues
- Verifikoni që connection string është i saktë
- Sigurohuni që password nuk ka karaktere specialë

### Build Errors
- Run `npm run build` lokalisht për testing
- Check Vercel deployment logs

### Slow Performance
- Enable connection pooling në Supabase
- Use `pgbouncer=true` në connection string

## Support
Për ndihmë shtesë: contact@proudshop.com
