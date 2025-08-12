#!/usr/bin/env node

/**
 * Verify Admin Credentials
 * Check if admin user exists and password is correct
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function verifyAdmin() {
  try {
    console.log('🔍 Checking admin user in database...\n')
    
    // Find admin user
    const admin = await prisma.admin.findUnique({
      where: { email: 'proudchannel2024@gmail.com' }
    })

    if (!admin) {
      console.log('❌ Admin user not found with email: proudchannel2024@gmail.com')
      
      // Check if old admin exists
      const oldAdmin = await prisma.admin.findUnique({
        where: { email: 'admin@proudshop.com' }
      })
      
      if (oldAdmin) {
        console.log('⚠️  Found old admin user: admin@proudshop.com')
        console.log('   Need to update or create new admin user')
      }
      
      return
    }

    console.log('✅ Admin user found:')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Name: ${admin.name}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Created: ${admin.createdAt}`)

    // Test password
    const passwordFromEnv = process.env.ADMIN_PASSWORD || 'lolinr123'
    const isPasswordValid = await bcrypt.compare(passwordFromEnv, admin.password)
    
    console.log(`\n🔐 Password verification:`)
    console.log(`   Expected password: ${passwordFromEnv}`)
    console.log(`   Password valid: ${isPasswordValid ? '✅ YES' : '❌ NO'}`)

    if (!isPasswordValid) {
      console.log('\n🔧 Creating admin user with correct password...')
      const hashedPassword = await bcrypt.hash(passwordFromEnv, 12)
      
      await prisma.admin.upsert({
        where: { email: 'proudchannel2024@gmail.com' },
        update: {
          password: hashedPassword,
          name: 'ProudShop Administrator'
        },
        create: {
          email: 'proudchannel2024@gmail.com',
          name: 'ProudShop Administrator',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          permissions: JSON.stringify(['MANAGE_USERS', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_ANALYTICS', 'MANAGE_SETTINGS', 'MANAGE_ADMINS'])
        }
      })
      
      console.log('✅ Admin user created/updated successfully!')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAdmin()
