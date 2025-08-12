import nodemailer from 'nodemailer'
import { AdminSettings } from './admin-settings'

async function createTransporter() {
  // Get SMTP settings from admin configuration
  const dbSmtpHost = await AdminSettings.get('smtp_host')
  const dbSmtpPort = await AdminSettings.get('smtp_port')
  const dbSmtpSecure = await AdminSettings.get('smtp_secure')
  const dbSmtpUser = await AdminSettings.get('smtp_user')
  const dbSmtpPassword = await AdminSettings.get('smtp_password')
  
  console.log('===== SMTP DEBUG v2 =====')
  console.log('Database Values:')
  console.log('- smtp_host:', dbSmtpHost)
  console.log('- smtp_port:', dbSmtpPort)
  console.log('- smtp_secure:', dbSmtpSecure)
  console.log('- smtp_user:', dbSmtpUser)
  console.log('- smtp_password:', dbSmtpPassword ? '[SET]' : '[NOT SET]')
  
  console.log('Environment Variables:')
  console.log('- SMTP_HOST:', process.env.SMTP_HOST)
  console.log('- SMTP_PORT:', process.env.SMTP_PORT)
  console.log('- SMTP_USER:', process.env.SMTP_USER)
  console.log('- SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '[SET]' : '[NOT SET]')
  
  const smtpHost = dbSmtpHost || process.env.SMTP_HOST
  const smtpPort = dbSmtpPort || process.env.SMTP_PORT || '587'
  const smtpSecure = dbSmtpSecure === 'true' || process.env.SMTP_SECURE === 'true'
  const smtpUser = dbSmtpUser || process.env.SMTP_USER
  const smtpPassword = dbSmtpPassword || process.env.SMTP_PASSWORD
  
  console.log('Final Configuration Used:')
  console.log('- host:', smtpHost)
  console.log('- port:', smtpPort)
  console.log('- secure:', smtpSecure)
  console.log('- user:', smtpUser)
  console.log('- password:', smtpPassword ? '[SET]' : '[NOT SET]')
  console.log('=====================')
  
  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: smtpSecure, // true për SSL (port 465), false për TLS (port 587)
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  })
}

interface EmailAttachment {
  filename: string
  content: string | Buffer
  contentType?: string
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
}

export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = await createTransporter()
    
    // Get email sender settings
    const emailFrom = await AdminSettings.get('smtp_from_email') || await AdminSettings.get('smtp_user') || process.env.SMTP_USER
    const emailFromName = await AdminSettings.get('smtp_from_name') || 'ProudShop'
    
    console.log('Email FROM settings:')
    console.log('- from email:', emailFrom)
    console.log('- from name:', emailFromName)
    
    const info = await transporter.sendMail({
      from: `${emailFromName} <${emailFrom}>`,
      ...options,
    })
    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export const emailTemplates = {
  orderConfirmation: (orderNumber: string, customerName: string, total: string) => `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #333;">Faleminderit për porosinë!</h1>
      <p>I dashur ${customerName},</p>
      <p>Porosia juaj me numër <strong>${orderNumber}</strong> është regjistruar me sukses!</p>
      <p>Totali: <strong>${total}</strong></p>
      <p>Do t'ju njoftojmë sapo porosia të niset për në adresën tuaj.</p>
      <hr>
      <p style="color: #666; font-size: 14px;">
        Faleminderit për besimin në Proudshop!<br>
        Ekipi i Proudshop
      </p>
    </div>
  `,
  
  orderProcessing: (orderNumber: string, customerName: string, total: string) => `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #ff6b35;">Porosia juaj është në proces!</h1>
      <p>I dashur ${customerName},</p>
      <p>Porosia juaj me numër <strong>${orderNumber}</strong> është marrë në dorëzim dhe po përgatitet për dërgim!</p>
      <p>Totali: <strong>${total}</strong></p>
      <p>Ne po punojmë për ta paketuar porosinë tuaj me kujdes. Do t'ju njoftojmë sapo të niset.</p>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #ff6b35; margin: 0 0 10px 0;">Çfarë ndodh tani?</h3>
        <p style="margin: 5px 0;">✅ Porosia është konfirmuar</p>
        <p style="margin: 5px 0;">🔄 Po përgatitet për dërgim</p>
        <p style="margin: 5px 0;">📦 Do të dërgohet së shpejti</p>
      </div>
      <hr>
      <p style="color: #666; font-size: 14px;">
        Faleminderit për besimin në Proudshop!<br>
        Ekipi i Proudshop
      </p>
    </div>
  `,
  
  orderShipped: (orderNumber: string, customerName: string, trackingNumber: string) => `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #28a745;">Porosia u nis!</h1>
      <p>I dashur ${customerName},</p>
      <p>Porosia juaj me numër <strong>${orderNumber}</strong> u nis dhe është në rrugë!</p>
      <p>Numri i ndjekjes: <strong>${trackingNumber}</strong></p>
      <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
        <h3 style="color: #155724; margin: 0 0 10px 0;">📦 Porosia në rrugë!</h3>
        <p style="margin: 5px 0; color: #155724;">Porosia juaj është dërguar dhe do të arrijë së shpejti.</p>
        <p style="margin: 5px 0; color: #155724;">Mund ta ndiqni porosinë tuaj duke përdorur numrin e ndjekjes.</p>
      </div>
      <hr>
      <p style="color: #666; font-size: 14px;">
        Faleminderit për besimin në Proudshop!<br>
        Ekipi i Proudshop
      </p>
    </div>
  `,
  
  marketingOffer: (customerName: string, productName: string, discount: string) => `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #e91e63;">Ofertë e Veçantë!</h1>
      <p>I dashur ${customerName},</p>
      <p>Kemi një ofertë të mrekullueshme për ju!</p>
      <h2 style="color: #333;">${productName}</h2>
      <p style="font-size: 18px; color: #e91e63;">
        <strong>${discount}% ZBRITJE</strong>
      </p>
      <p>Mos e humbisni këtë mundësi! Oferta vlen për kohë të kufizuar.</p>
      <a href="http://localhost:3000" style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
        Blej Tani
      </a>
      <hr>
      <p style="color: #666; font-size: 14px;">
        Faleminderit për besimin në Proudshop!<br>
        Ekipi i Proudshop
      </p>
    </div>
  `
}
