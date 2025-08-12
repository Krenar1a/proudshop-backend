import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/utils'

const prisma = new PrismaClient()

async function createDefaultAdmin() {
  try {
    // Check if any admin exists
    const existingAdmin = await prisma.admin.findFirst()
    
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email)
      return
    }

    // Create default admin
    const email = process.env.ADMIN_EMAIL || 'admin@proudshop.com'
    const password = process.env.ADMIN_PASSWORD || 'Admin123!'
    const hashedPassword = await hashPassword(password)

    const admin = await prisma.admin.create({
      data: {
        name: 'Super Admin',
        email: email,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        permissions: JSON.stringify([
          'CREATE_CAMPAIGNS',
          'EDIT_CAMPAIGNS', 
          'DELETE_CAMPAIGNS',
          'VIEW_ALL_CAMPAIGNS',
          'MANAGE_BUDGETS',
          'VIEW_ANALYTICS',
          'MANAGE_AUDIENCES',
          'EXPORT_DATA',
          'MANAGE_ADMINS',
          'MANAGE_SETTINGS'
        ])
      }
    })

    console.log('✅ Default admin created successfully!')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('👤 Name:', admin.name)
    console.log('🛡️ Role:', admin.role)
    
  } catch (error) {
    console.error('❌ Error creating default admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultAdmin()
