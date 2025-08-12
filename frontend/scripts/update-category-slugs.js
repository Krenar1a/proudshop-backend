const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
}

async function updateCategorySlugs() {
  try {
    console.log('Fetching categories...');
    const categories = await prisma.category.findMany();
    
    console.log(`Found ${categories.length} categories`);
    
    for (const category of categories) {
      // If category doesn't have a slug or slug is empty, create one
      if (!category.slug || category.slug.trim() === '') {
        const newSlug = createSlug(category.name);
        
        // Check if slug already exists
        const existingCategory = await prisma.category.findFirst({
          where: {
            slug: newSlug,
            id: { not: category.id }
          }
        });
        
        let finalSlug = newSlug;
        let counter = 1;
        
        // If slug exists, add number suffix
        while (existingCategory) {
          finalSlug = `${newSlug}-${counter}`;
          const checkAgain = await prisma.category.findFirst({
            where: {
              slug: finalSlug,
              id: { not: category.id }
            }
          });
          if (!checkAgain) break;
          counter++;
        }
        
        console.log(`Updating category "${category.name}" with slug: "${finalSlug}"`);
        
        await prisma.category.update({
          where: { id: category.id },
          data: { slug: finalSlug }
        });
      } else {
        console.log(`Category "${category.name}" already has slug: "${category.slug}"`);
      }
    }
    
    console.log('✅ Category slugs updated successfully!');
    
    // Display all categories with their slugs
    const updatedCategories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    console.log('\n📋 All categories with slugs:');
    updatedCategories.forEach(cat => {
      console.log(`- ${cat.name} → /${cat.slug} (${cat._count.products} products)`);
    });
    
  } catch (error) {
    console.error('❌ Error updating category slugs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCategorySlugs();
