import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user - Use secure setup script in production
  // This is just for development/demo purposes
  const tempPassword = process.env.ADMIN_PASSWORD || 'changeme_on_first_login'
  const hashedPassword = await bcrypt.hash(tempPassword, 12)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'proudchannel2024@gmail.com' },
    update: {},
    create: {
      email: 'proudchannel2024@gmail.com',
      name: 'ProudShop Administrator',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      permissions: JSON.stringify(['MANAGE_USERS', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_ANALYTICS', 'MANAGE_SETTINGS', 'MANAGE_ADMINS'])
    }
  })

  // Create categories
  const categories = [
    {
      name: 'Kuzhinë',
      nameEn: 'Kitchen',
      nameSq: 'Kuzhinë',
      slug: 'kuzhinë',
      description: 'Të gjitha pajisjet për kuzhinën tuaj',
      image: '🍳'
    },
    {
      name: 'Shtëpi',
      nameEn: 'Home',
      nameSq: 'Shtëpi',
      slug: 'shtëpi',
      description: 'Aksesorë dhe dekorime për shtëpinë',
      image: '🏠'
    },
    {
      name: 'Sport',
      nameEn: 'Sports',
      nameSq: 'Sport',
      slug: 'sport',
      description: 'Pajisje dhe aksesorë sportivë',
      image: '⚽'
    },
    {
      name: 'Teknologji',
      nameEn: 'Technology',
      nameSq: 'Teknologji',
      slug: 'teknologji',
      description: 'Pajisje teknologjike dhe aksesorë',
      image: '📱'
    },
    {
      name: 'Bukuri',
      nameEn: 'Beauty',
      nameSq: 'Bukuri',
      slug: 'bukuri',
      description: 'Produkte të bukurisë dhe kujdesit personal',
      image: '💄'
    },
    {
      name: 'Auto',
      nameEn: 'Auto',
      nameSq: 'Auto',
      slug: 'auto',
      description: 'Aksesorë dhe pajisje për automjetet',
      image: '🚗'
    }
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    })
    createdCategories.push(created)
    console.log(`✅ Category created: ${created.name}`)
  }

  // Create sample products
  const products = [
    {
      name: 'Set tenxherash premium',
      nameEn: 'Premium Cookware Set',
      nameSq: 'Set tenxherash premium',
      description: 'Set i plotë tenxherash me cilësi të lartë, ideal për çdo kuzhinë moderne. Përfshin 8 copa të ndryshme për të gjitha nevojat tuaja të gatimit.',
      shortDesc: 'Set i plotë tenxherash me cilësi të lartë',
      sku: 'COOK-SET-001',
      price: 89.99,
      discountPrice: 69.99,
      discountPercentage: 22,
      images: JSON.stringify(['https://via.placeholder.com/400x400?text=Cookware+Set']),
      thumbnail: 'https://via.placeholder.com/400x400?text=Cookware+Set',
      categoryId: createdCategories[0].id, // Kuzhinë
      brand: 'ProudKitchen',
      stockQuantity: 25,
      isFeatured: true,
      tags: JSON.stringify(['kuzhinë', 'tenxhere', 'gatim', 'premium'])
    },
    {
      name: 'Blender i fuqishëm 1500W',
      nameEn: 'Powerful 1500W Blender',
      nameSq: 'Blender i fuqishëm 1500W',
      description: 'Blender profesional me fuqi 1500W, perfekt për smoothie, lëngje dhe përgatitje të tjera. Motor i qëndrueshëm dhe dizajn elegant.',
      shortDesc: 'Blender profesional 1500W',
      sku: 'BLEND-1500-001',
      price: 149.99,
      discountPrice: 119.99,
      discountPercentage: 20,
      images: JSON.stringify(['https://via.placeholder.com/400x400?text=Blender+1500W']),
      thumbnail: 'https://via.placeholder.com/400x400?text=Blender+1500W',
      categoryId: createdCategories[0].id, // Kuzhinë
      brand: 'PowerBlend',
      stockQuantity: 15,
      isFeatured: true,
      tags: JSON.stringify(['blender', 'kuzhinë', '1500w', 'smoothie'])
    },
    {
      name: 'Drita LED inteligjente',
      nameEn: 'Smart LED Light',
      nameSq: 'Drita LED inteligjente',
      description: 'Drita LED që mund të kontrollohet me aplikacion, me ndryshim ngjyrash dhe intensiteti. Perfekte për ambient modern.',
      shortDesc: 'Drita LED me kontroll nga telefoni',
      sku: 'LED-SMART-001',
      price: 39.99,
      discountPrice: 29.99,
      discountPercentage: 25,
      images: JSON.stringify(['https://via.placeholder.com/400x400?text=Smart+LED']),
      thumbnail: 'https://via.placeholder.com/400x400?text=Smart+LED',
      categoryId: createdCategories[1].id, // Shtëpi
      brand: 'SmartHome',
      stockQuantity: 50,
      isFeatured: false,
      tags: JSON.stringify(['drita', 'led', 'inteligjente', 'ambient'])
    },
    {
      name: 'Top sportiv për gra',
      nameEn: 'Women Sports Top',
      nameSq: 'Top sportiv për gra',
      description: 'Top sportiv i rehatshëm për stërvitje, i bërë nga material i përshtatshëm që lejon frymëmarrjen e lirë.',
      shortDesc: 'Top sportiv i rehatshëm për stërvitje',
      sku: 'SPORT-TOP-W001',
      price: 24.99,
      discountPrice: 19.99,
      discountPercentage: 20,
      images: JSON.stringify(['https://via.placeholder.com/400x400?text=Sports+Top']),
      thumbnail: 'https://via.placeholder.com/400x400?text=Sports+Top',
      categoryId: createdCategories[2].id, // Sport
      brand: 'FitWear',
      stockQuantity: 30,
      isFeatured: false,
      tags: JSON.stringify(['sport', 'top', 'gra', 'stërvitje'])
    },
    {
      name: 'Kufje wireless premium',
      nameEn: 'Premium Wireless Headphones',
      nameSq: 'Kufje wireless premium',
      description: 'Kufje wireless me cilësi të lartë audio, battery që zgjat 30 orë dhe anulim aktiv i zhurmës.',
      shortDesc: 'Kufje wireless me cilësi premium',
      sku: 'HEADPHONE-WL001',
      price: 199.99,
      discountPrice: 159.99,
      discountPercentage: 20,
      images: JSON.stringify(['https://via.placeholder.com/400x400?text=Wireless+Headphones']),
      thumbnail: 'https://via.placeholder.com/400x400?text=Wireless+Headphones',
      categoryId: createdCategories[3].id, // Teknologji
      brand: 'AudioPro',
      stockQuantity: 20,
      isFeatured: true,
      tags: JSON.stringify(['kufje', 'wireless', 'audio', 'premium'])
    },
    {
      name: 'Set make-up profesional',
      nameEn: 'Professional Makeup Set',
      nameSq: 'Set make-up profesional',
      description: 'Set komplet i make-up-it me të gjitha produktet e nevojshme për një look të përkryer. Cilësi profesionale.',
      shortDesc: 'Set komplet make-up profesional',
      sku: 'MAKEUP-SET-001',
      price: 79.99,
      discountPrice: 59.99,
      discountPercentage: 25,
      images: JSON.stringify(['https://via.placeholder.com/400x400?text=Makeup+Set']),
      thumbnail: 'https://via.placeholder.com/400x400?text=Makeup+Set',
      categoryId: createdCategories[4].id, // Bukuri
      brand: 'GlamBeauty',
      stockQuantity: 18,
      isFeatured: true,
      tags: JSON.stringify(['makeup', 'bukuri', 'profesional', 'set'])
    },
    {
      name: 'Mbulesa sedilje auto',
      nameEn: 'Car Seat Covers',
      nameSq: 'Mbulesa sedilje auto',
      description: 'Mbulesa cilësore për sedilje automjeti, të bëra nga material i qëndrueshëm dhe të lehtë për t\'u pastruar.',
      shortDesc: 'Mbulesa cilësore për sedilje auto',
      sku: 'AUTO-COVER-001',
      price: 49.99,
      discountPrice: 39.99,
      discountPercentage: 20,
      images: JSON.stringify(['https://via.placeholder.com/400x400?text=Car+Seat+Covers']),
      thumbnail: 'https://via.placeholder.com/400x400?text=Car+Seat+Covers',
      categoryId: createdCategories[5].id, // Auto
      brand: 'AutoComfort',
      stockQuantity: 12,
      isFeatured: false,
      tags: JSON.stringify(['auto', 'mbulesa', 'sedilje', 'aksesorë'])
    },
    {
      name: 'Kafetiere ekspres',
      nameEn: 'Espresso Coffee Machine',
      nameSq: 'Kafetiere ekspres',
      description: 'Makinë profesionale për kafe ekspres, me presion 15 bar dhe rezervuar uji 1.5L. Perfekte për shtëpi dhe zyrë.',
      shortDesc: 'Makinë kafe ekspres profesionale',
      sku: 'COFFEE-ESP-001',
      price: 299.99,
      discountPrice: 249.99,
      discountPercentage: 17,
      images: JSON.stringify(['https://via.placeholder.com/400x400?text=Espresso+Machine']),
      thumbnail: 'https://via.placeholder.com/400x400?text=Espresso+Machine',
      categoryId: createdCategories[0].id, // Kuzhinë
      brand: 'CoffeeMaster',
      stockQuantity: 8,
      isFeatured: true,
      tags: JSON.stringify(['kafe', 'ekspres', 'makinë', 'profesionale'])
    }
  ]

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product
    })
    console.log(`✅ Product created: ${created.name}`)
  }

  // Create some settings
  const settings = [
    { key: 'site_name', value: 'ProudShop', type: 'string' },
    { key: 'site_description', value: 'Dyqani juaj online më i besueshëm', type: 'string' },
    { key: 'contact_email', value: 'info@proudshop.com', type: 'string' },
    { key: 'contact_phone', value: '+383 44 123 456', type: 'string' },
    { key: 'shipping_cost_kosovo', value: '5', type: 'number' },
    { key: 'free_shipping_threshold_kosovo', value: '50', type: 'number' },
    { key: 'shipping_cost_albania', value: '500', type: 'number' },
    { key: 'free_shipping_threshold_albania', value: '5000', type: 'number' }
  ]

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    })
    console.log(`✅ Setting created: ${setting.key}`)
  }

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
