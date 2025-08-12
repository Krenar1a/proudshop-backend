const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

// Encryption utilities (copied from admin-settings.ts)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'

function encrypt(text) {
  if (!text) return ''
  
  try {
    const algorithm = 'aes-256-gcm'
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(algorithm, key)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  } catch (error) {
    // Fallback to simple base64 encoding
    return Buffer.from(text).toString('base64')
  }
}

async function setSetting(key, value, category = 'general', description = '') {
  const encryptedValue = encrypt(value)
  
  await prisma.adminSetting.upsert({
    where: { key },
    update: {
      value: encryptedValue,
      category,
      description,
      updatedAt: new Date()
    },
    create: {
      key,
      value: encryptedValue,
      category,
      description
    }
  })
}

async function initializeSettings() {
  try {
    console.log('🔧 Initializing admin settings...')

    // Check if settings already exist
    const existingSettings = await prisma.adminSetting.findMany()
    
    if (existingSettings.length > 0) {
      console.log('⚠️  Settings already exist, skipping initialization')
      return
    }

    // Facebook API Settings
    await setSetting('FACEBOOK_ACCESS_TOKEN', '', 'facebook', 'Facebook Access Token për Graph API')
    await setSetting('FACEBOOK_AD_ACCOUNT_ID', '', 'facebook', 'Facebook Ad Account ID')
    await setSetting('FACEBOOK_APP_ID', '', 'facebook', 'Facebook App ID')
    await setSetting('FACEBOOK_APP_SECRET', '', 'facebook', 'Facebook App Secret')

    // OpenAI API Settings  
    await setSetting('OPENAI_API_KEY', '', 'ai', 'OpenAI API Key për AI features')

    // Stripe API Settings
    await setSetting('STRIPE_SECRET_KEY', '', 'payment', 'Stripe Secret Key për pagesat')
    await setSetting('STRIPE_PUBLISHABLE_KEY', '', 'payment', 'Stripe Publishable Key')
    await setSetting('STRIPE_WEBHOOK_SECRET', '', 'payment', 'Stripe Webhook Secret')

    // Email Settings
    await setSetting('EMAIL_HOST', '', 'email', 'SMTP Host për dërgimin e email-ave')
    await setSetting('EMAIL_PORT', '587', 'email', 'SMTP Port')
    await setSetting('EMAIL_USER', '', 'email', 'SMTP Username')
    await setSetting('EMAIL_PASSWORD', '', 'email', 'SMTP Password')
    await setSetting('EMAIL_FROM', '', 'email', 'From Email Address')

    // General Settings
    await setSetting('SITE_NAME', 'Proudshop', 'general', 'Emri i faqes')
    await setSetting('SITE_URL', 'https://localhost:3000', 'general', 'URL e faqes')
    await setSetting('ADMIN_EMAIL', 'admin@proudshop.com', 'general', 'Email i administratorit')

    console.log('✅ Settings initialized successfully!')
    console.log('🔑 Please configure your API keys in Admin Dashboard > API Settings')

  } catch (error) {
    console.error('❌ Error initializing settings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the initialization
initializeSettings()
