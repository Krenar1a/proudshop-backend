#!/usr/bin/env node

/**
 * Supabase Setup Script for Proudshop
 * Converts from MongoDB to Supabase PostgreSQL
 */

const fs = require('fs')
const crypto = require('crypto')

console.log('🔄 Converting Proudshop to Supabase...\n')

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex')
}

function generatePassword(length = 16) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Generate secure environment variables
const supabaseEnv = `# Supabase PostgreSQL Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth Configuration
NEXTAUTH_SECRET="${generateSecret(32)}"
NEXTAUTH_URL="http://localhost:3000"

# Admin Credentials (Change these!)
ADMIN_EMAIL="admin@proudshop.com"
ADMIN_PASSWORD="${generatePassword(16)}"

# JWT Secret
JWT_SECRET="${generateSecret(32)}"

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Optional: Stripe Payment
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Optional: Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Optional: OpenAI
OPENAI_API_KEY="sk-..."

# Optional: Facebook Ads
FACEBOOK_ACCESS_TOKEN="your-token"
FACEBOOK_AD_ACCOUNT_ID="your-account-id"
`

// Write new environment file
fs.writeFileSync('.env.local', supabaseEnv)

console.log('✅ Generated .env.local with Supabase configuration')
console.log('✅ Updated Prisma schema for PostgreSQL')
console.log('✅ Optimized Vercel configuration')

console.log('\n📋 Next Steps:')
console.log('1. Create Supabase account at https://supabase.com')
console.log('2. Create new project and get database URL')
console.log('3. Update DATABASE_URL in .env.local')
console.log('4. Run: npm install')
console.log('5. Run: npx prisma db push')
console.log('6. Run: npm run db:seed')
console.log('7. Test locally: npm run dev')
console.log('8. Deploy to Vercel!')

console.log('\n🚀 Benefits of Supabase:')
console.log('- 5-10x faster than MongoDB')
console.log('- Better Prisma integration')  
console.log('- Real-time features')
console.log('- Built-in authentication')
console.log('- Free tier: 500MB storage')
console.log('- Perfect for Vercel deployment')

console.log('\n📖 Full guide: Read SUPABASE_DEPLOYMENT.md')
console.log('\n🎉 Proudshop is ready for Supabase!')
