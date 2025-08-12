const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixPlaceholderImages() {
  try {
    console.log('🔍 Checking for products with old placeholder images...')
    
    // Find all products and check their images/thumbnails
    const allProducts = await prisma.product.findMany()
    
    console.log(`Found ${allProducts.length} total products`)
    
    let updatedCount = 0
    
    for (const product of allProducts) {
      let needsUpdate = false
      let updatedData = {}
      
      // Check thumbnail
      if (product.thumbnail && (product.thumbnail === '/placeholder-image.jpg' || product.thumbnail === 'placeholder-image.jpg')) {
        updatedData.thumbnail = '/placeholder-image.svg'
        needsUpdate = true
        console.log(`Product "${product.name}" - updating thumbnail`)
      }
      
      // Check images (stored as JSON string)
      let images = []
      try {
        images = JSON.parse(product.images || '[]')
      } catch (e) {
        images = []
      }
      
      const updatedImages = images.map(img => {
        if (img === '/placeholder-image.jpg' || img === 'placeholder-image.jpg') {
          needsUpdate = true
          console.log(`Product "${product.name}" - updating image: ${img}`)
          return '/placeholder-image.svg'
        }
        return img
      })
      
      if (JSON.stringify(images) !== JSON.stringify(updatedImages)) {
        updatedData.images = JSON.stringify(updatedImages)
        needsUpdate = true
      }
      
      // Update if needed
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: updatedData
        })
        updatedCount++
      }
    }

    console.log(`✅ Updated ${updatedCount} products with new placeholder images`)

    // Also check and update categories if they have placeholder images
    const allCategories = await prisma.category.findMany()
    let updatedCategoriesCount = 0
    
    for (const category of allCategories) {
      if (category.image && (category.image === '/placeholder-image.jpg' || category.image === 'placeholder-image.jpg')) {
        console.log(`Updating category: ${category.name}`)
        
        await prisma.category.update({
          where: { id: category.id },
          data: {
            image: '/placeholder-image.svg'
          }
        })
        updatedCategoriesCount++
      }
    }

    console.log(`✅ Updated ${updatedCategoriesCount} categories with new placeholder images`)

  } catch (error) {
    console.error('❌ Error fixing placeholder images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPlaceholderImages()
