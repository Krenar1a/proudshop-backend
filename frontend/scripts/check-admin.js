const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admins = await prisma.admin.findMany();
    console.log('Found admins:', admins.length);
    
    if (admins.length === 0) {
      console.log('No admins found, creating default admin...');
      
      // Krijo admin të ri nëse nuk ka
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('lolinr123', 10);
      
      const newAdmin = await prisma.admin.create({
        data: {
          email: 'proudchannel2024@gmail.com',
          name: 'Administrator',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          permissions: JSON.stringify(['full_access'])
        }
      });
      
      console.log('Created admin:', newAdmin.email);
    } else {
      admins.forEach(admin => {
        console.log(`- ${admin.email} (${admin.role})`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
