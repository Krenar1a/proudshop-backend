#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const prisma = new PrismaClient()

function generateSecurePassword(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

async function setupSecureAdmin() {
  console.log('🔐 Setting up secure admin account...\n')

  try {
    await prisma.$connect()

    // Generate secure password
    const securePassword = generateSecurePassword()
    const hashedPassword = await bcrypt.hash(securePassword, 12)

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: 'admin@proudshop.com' }
    })

    if (existingAdmin) {
      // Update existing admin with new secure password
      await prisma.admin.update({
        where: { email: 'admin@proudshop.com' },
        data: {
          password: hashedPassword,
          name: 'Administrator'
        }
      })
      console.log('✅ Admin account updated with secure credentials')
    } else {
      // Create new admin
      await prisma.admin.create({
        data: {
          email: 'admin@proudshop.com',
          password: hashedPassword,
          name: 'Administrator',
          role: 'SUPER_ADMIN'
        }
      })
      console.log('✅ New admin account created')
    }

    console.log('\n🔑 ADMIN CREDENTIALS (SAVE THESE SECURELY):')
    console.log('----------------------------------------')
    console.log(`Email: admin@proudshop.com`)
    console.log(`Password: ${securePassword}`)
    console.log('----------------------------------------')
    console.log('\n⚠️  IMPORTANT SECURITY NOTES:')
    console.log('1. Save these credentials in a secure password manager')
    console.log('2. Change the password after first login')
    console.log('3. Do not share these credentials')
    console.log('4. Consider enabling 2FA in the future')
    console.log('\n🚀 Admin setup complete!')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupSecureAdmin()
