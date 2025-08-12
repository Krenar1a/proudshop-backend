const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSampleChats() {
  try {
    console.log('🗨️  Creating sample chat sessions...')

    // Delete existing chat data
    await prisma.chatMessage.deleteMany()
    await prisma.chatSession.deleteMany()

    // Create chat sessions
    const session1 = await prisma.chatSession.create({
      data: {
        userEmail: 'arben@email.com',
        userName: 'Arben Krasniqi',
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      }
    })

    const session2 = await prisma.chatSession.create({
      data: {
        userEmail: 'linda@email.com',
        userName: 'Linda Hoxha',
        status: 'WAITING',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      }
    })

    const session3 = await prisma.chatSession.create({
      data: {
        userEmail: 'besart@email.com',
        userName: 'Besart Berisha',
        status: 'CLOSED',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000) // 20 hours ago
      }
    })

    const session4 = await prisma.chatSession.create({
      data: {
        userEmail: 'fjona@email.com',
        userName: 'Fjona Zenuni',
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        updatedAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      }
    })

    // Create messages for session 1
    await prisma.chatMessage.create({
      data: {
        sessionId: session1.id,
        sender: 'USER',
        message: 'Përshëndetje, kam një pyetje për porosinë time',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    })

    await prisma.chatMessage.create({
      data: {
        sessionId: session1.id,
        sender: 'ADMIN',
        message: 'Përshëndetje! Si mund t\'ju ndihmoj?',
        isRead: true,
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
      }
    })

    await prisma.chatMessage.create({
      data: {
        sessionId: session1.id,
        sender: 'USER',
        message: 'A mund të më ndihmoni me dorëzimin? Kur do të arrijë porositja ime?',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    })

    // Create messages for session 2
    await prisma.chatMessage.create({
      data: {
        sessionId: session2.id,
        sender: 'USER',
        message: 'Jam duke pritur përgjigje për produktin që pyeta më herët...',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    })

    // Create messages for session 3
    await prisma.chatMessage.create({
      data: {
        sessionId: session3.id,
        sender: 'USER',
        message: 'Faleminderit për ndihmën me kthimin e produktit!',
        isRead: true,
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000)
      }
    })

    await prisma.chatMessage.create({
      data: {
        sessionId: session3.id,
        sender: 'ADMIN',
        message: 'Gëzohemi që mund t\'ju ndihmojmë! Nëse keni nevojë për diçka tjetër, mos hezitoni të na kontaktoni.',
        isRead: true,
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
      }
    })

    // Create messages for session 4
    await prisma.chatMessage.create({
      data: {
        sessionId: session4.id,
        sender: 'USER',
        message: 'Mund të më tregoni më shumë për ofertën speciale?',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000)
      }
    })

    console.log('✅ Sample chat sessions created successfully!')
    console.log(`📊 Created:`)
    console.log(`   - ${4} chat sessions`)
    console.log(`   - ${7} chat messages`)

  } catch (error) {
    console.error('❌ Error creating sample chats:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createSampleChats()
