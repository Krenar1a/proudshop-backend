import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message, orderNumber } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Emri, email-i dhe mesazhi janë të detyrueshëm' },
        { status: 400 }
      )
    }

    // Send email to admin
    await sendEmail({
      to: 'info@proudshop.com',
      subject: `[ProudShop] ${subject || 'Mesazh i ri nga klienti'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Mesazh i ri nga klienti</h2>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
            <p><strong>Emri:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Telefoni:</strong> ${phone}</p>` : ''}
            ${orderNumber ? `<p><strong>Numri i porosisë:</strong> ${orderNumber}</p>` : ''}
            <p><strong>Subjekti:</strong> ${subject || 'Mesazh i përgjithshëm'}</p>
            
            <div style="margin-top: 20px;">
              <strong>Mesazhi:</strong>
              <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Ky mesazh u dërgua nga forma e kontaktit në ProudShop.
          </p>
        </div>
      `
    })

    // Send confirmation to customer
    await sendEmail({
      to: email,
      subject: 'Mesazhi juaj u dërgua me sukses - ProudShop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">ProudShop</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Faleminderit për kontaktin!</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p>I dashur/e ${name},</p>
            
            <p>Faleminderit për mesazhin tuaj. Ne kemi marrë kërkesën tuaj dhe do t'ju përgjigjemi brenda 24 orëve.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Detajet e mesazhit tuaj:</h3>
              <p><strong>Subjekti:</strong> ${subject || 'Mesazh i përgjithshëm'}</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <p>Nëse keni nevojë për përgjigjje të menjëhershme, mund të na kontaktoni në:</p>
            <ul>
              <li>📞 Viber/WhatsApp: +383 44 123 456</li>
              <li>✉️ Email: info@proudshop.com</li>
            </ul>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0;">Faleminderit për besimin në ProudShop!</p>
          </div>
        </div>
      `
    })

    return NextResponse.json({
      success: true,
      message: 'Mesazhi u dërgua me sukses'
    })

  } catch (error) {
    console.error('Error sending contact message:', error)
    return NextResponse.json(
      { error: 'Gabim në dërgimin e mesazhit' },
      { status: 500 }
    )
  }
}
