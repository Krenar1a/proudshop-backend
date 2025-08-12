// Quick test to see what's in the database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSmtpSettings() {
  try {
    console.log('=== CHECKING DATABASE SMTP SETTINGS ===');
    
    const smtpSettings = await prisma.adminSetting.findMany({
      where: {
        key: {
          startsWith: 'smtp_'
        }
      }
    });
    
    console.log('Found SMTP settings in database:');
    smtpSettings.forEach(setting => {
      console.log(`- ${setting.key}: ${setting.value ? '[SET]' : '[NOT SET]'}`);
    });
    
    console.log('\nEnvironment variables:');
    console.log(`- SMTP_HOST: ${process.env.SMTP_HOST || '[NOT SET]'}`);
    console.log(`- SMTP_USER: ${process.env.SMTP_USER || '[NOT SET]'}`);
    console.log(`- SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? '[SET]' : '[NOT SET]'}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSmtpSettings();
