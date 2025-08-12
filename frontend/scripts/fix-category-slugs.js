const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function createSlug(name) {
  return name
    .toLowerCase()
    // Replace Albanian special characters
    .replace(/ë/g, 'e')
    .replace(/ç/g, 'c')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '') // Remove other special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
}

async function fixCategorySlugs() {
  try {
    console.log('Updating category slugs to be URL-friendly...');
    
    const categories = await prisma.category.findMany();
    
    for (const category of categories) {
      const newSlug = createSlug(category.name);
      
      if (category.slug !== newSlug) {
        console.log(`Updating "${category.name}": "${category.slug}" → "${newSlug}"`);
        
        await prisma.category.update({
          where: { id: category.id },
          data: { slug: newSlug }
        });
      }
    }
    
    console.log('✅ Category slugs updated to be URL-friendly!');
    
    // Display updated categories
    const updatedCategories = await prisma.category.findMany({
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    console.log('\n📋 Updated categories:');
    updatedCategories.forEach(cat => {
      console.log(`- ${cat.name} → /category/${cat.slug} (${cat._count.products} products)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCategorySlugs();
