const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Check admins
    const adminCount = await prisma.admin.count()
    console.log(`👤 Admins in database: ${adminCount}`)
    
    if (adminCount === 0) {
      console.log('⚠️  No admins found. Creating default admin...')
      
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const admin = await prisma.admin.create({
        data: {
          email: 'admin@proudshop.com',
          name: 'Super Admin',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          permissions: JSON.stringify([
            'MANAGE_USERS',
            'MANAGE_PRODUCTS',
            'MANAGE_ORDERS',
            'MANAGE_ANALYTICS',
            'MANAGE_SETTINGS',
            'MANAGE_ADMINS',
            'MANAGE_MARKETING',
            'MANAGE_CHAT'
          ])
        }
      })
      
      console.log('✅ Default admin created:', admin.email)
    }
    
    // Check orders
    const orderCount = await prisma.order.count()
    console.log(`📦 Orders in database: ${orderCount}`)
    
    // Check products
    const productCount = await prisma.product.count()
    console.log(`🛍️  Products in database: ${productCount}`)
    
    // Check categories
    const categoryCount = await prisma.category.count()
    console.log(`📂 Categories in database: ${categoryCount}`)
    
  } catch (error) {
    console.error('❌ Database error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()