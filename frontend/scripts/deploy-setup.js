#!/usr/bin/env node

/**
 * Deployment Setup Script
 * Prepares the project for GitHub and Vercel deployment
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

console.log('🚀 Preparing Proudshop for deployment...\n')

// Generate secure secrets
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex')
}

function generatePassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Create production environment template
const productionEnv = `# Production Environment Variables for Vercel
# Copy these to your Vercel Dashboard → Settings → Environment Variables

# Database (MongoDB Atlas)
DATABASE_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/proudshop?retryWrites=true&w=majority

# Security
JWT_SECRET=${generateSecret(32)}

# Admin Credentials
ADMIN_EMAIL=admin@proudshop.com
ADMIN_PASSWORD=${generatePassword(16)}

# Stripe Payment
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# OpenAI (Optional)
OPENAI_API_KEY=sk-...

# Facebook Ads (Optional)
FACEBOOK_ACCESS_TOKEN=your-token
FACEBOOK_AD_ACCOUNT_ID=your-account-id
FACEBOOK_PAGE_ID=your-page-id
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret

# Base URL (Update with your domain)
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
`

// Write production environment file
fs.writeFileSync('.env.production', productionEnv)

console.log('✅ Generated .env.production with secure secrets')
console.log('✅ Updated Prisma schema for MongoDB')
console.log('✅ Created Vercel configuration')
console.log('✅ Setup GitHub Actions workflow')
console.log('✅ Created deployment documentation')

console.log('\n📋 Next Steps:')
console.log('1. Push code to GitHub:')
console.log('   git add .')
console.log('   git commit -m "Prepare for deployment"')
console.log('   git push origin main')
console.log('')
console.log('2. Setup MongoDB Atlas:')
console.log('   - Create free cluster at https://www.mongodb.com/atlas')
console.log('   - Get connection string')
console.log('')
console.log('3. Deploy to Vercel:')
console.log('   - Import GitHub repository at https://vercel.com')
console.log('   - Add environment variables from .env.production')
console.log('   - Deploy!')
console.log('')
console.log('4. Initialize admin:')
console.log('   - Visit: https://your-domain.vercel.app/api/admin/setup')
console.log('')
console.log('📖 Full guide: Read DEPLOYMENT.md')
console.log('')
console.log('🎉 Your Proudshop is ready for deployment!')

// Create deployment checklist
const checklist = `# Deployment Checklist

## Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables prepared

## Vercel Setup
- [ ] Repository imported to Vercel
- [ ] Environment variables added
- [ ] Custom domain configured (optional)

## Post-Deployment
- [ ] Admin user created (/api/admin/setup)
- [ ] Admin panel accessible (/admin/login)
- [ ] Email configuration tested
- [ ] Payment methods configured
- [ ] SSL certificate active

## Production Checklist
- [ ] Database backups enabled
- [ ] Monitoring setup
- [ ] Error tracking configured
- [ ] Performance optimized
- [ ] Security headers verified

## Go Live
- [ ] DNS configured
- [ ] Domain redirects setup
- [ ] Analytics enabled
- [ ] SEO optimized
- [ ] Social media integrated

---
Generated on: ${new Date().toISOString()}
`

fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', checklist)
console.log('📝 Created deployment checklist: DEPLOYMENT_CHECKLIST.md')