#!/usr/bin/env node

/**
 * Supabase Configuration Helper
 * Shows exact steps to complete setup
 */

console.log('🔧 Supabase Configuration Status\n')

// Check if we have the API keys
const fs = require('fs')
let envContent = ''
try {
  envContent = fs.readFileSync('.env.local', 'utf8')
} catch (error) {
  console.log('❌ .env.local file not found')
  process.exit(1)
}

const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL')
const hasAnonKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')
const hasServiceKey = envContent.includes('SUPABASE_SERVICE_ROLE_KEY')
const hasDatabaseUrl = envContent.includes('DATABASE_URL') && !envContent.includes('[YOUR-DATABASE-PASSWORD]')

console.log('✅ Supabase URL configured')
console.log('✅ Anon Key configured')
console.log('✅ Service Role Key configured')

if (!hasDatabaseUrl) {
  console.log('⚠️  Database URL needs password')
  console.log('\n📋 To get your database password:')
  console.log('1. Go to: https://supabase.com/dashboard/project/btgfxzycmashqxtmxqfo')
  console.log('2. Click on "Settings" → "Database"')
  console.log('3. Scroll down to "Connection String"')
  console.log('4. Copy the "Connection String" and look for the password')
  console.log('5. OR create a new password if needed')
  console.log('\n6. Replace [YOUR-DATABASE-PASSWORD] in .env.local with the actual password')
  console.log('\nExample:')
  console.log('DATABASE_URL="postgresql://postgres:your_actual_password@db.btgfxzycmashqxtmxqfo.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"')
} else {
  console.log('✅ Database URL configured')
}

console.log('\n🚀 Next Steps:')
if (!hasDatabaseUrl) {
  console.log('1. Get database password from Supabase Dashboard')
  console.log('2. Update DATABASE_URL and DIRECT_URL in .env.local')
  console.log('3. Run: npm install')
  console.log('4. Run: npx prisma db push')
  console.log('5. Run: npm run db:seed')
  console.log('6. Test: npm run dev')
} else {
  console.log('1. Run: npm install')
  console.log('2. Run: npx prisma db push')
  console.log('3. Run: npm run db:seed')
  console.log('4. Test: npm run dev')
  console.log('5. Deploy to Vercel!')
}

console.log('\n🔗 Useful Links:')
console.log('Dashboard: https://supabase.com/dashboard/project/btgfxzycmashqxtmxqfo')
console.log('Database: https://supabase.com/dashboard/project/btgfxzycmashqxtmxqfo/settings/database')
console.log('API Keys: https://supabase.com/dashboard/project/btgfxzycmashqxtmxqfo/settings/api')

console.log('\n💡 Pro Tip:')
console.log('You can also use "Connection pooler" for better performance:')
console.log('- Enable it in Database Settings')
console.log('- Use port 6543 instead of 5432')
console.log('- Add ?pgbouncer=true to connection string')
