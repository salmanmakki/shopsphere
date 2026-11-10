import 'dotenv/config'
import { connectDB, disconnectDB } from '../config/db.js'
import Product from '../models/Product.js'

const image = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`

const products = [
  {
    name: 'Studio Wireless Headphones',
    description:
      'Immersive over-ear headphones with adaptive noise cancellation, plush memory-foam cushions and a 40-hour battery. Designed for focused listening without visual clutter.',
    category: 'Electronics',
    price: 249,
    originalPrice: 299,
    image: image('photo-1505740420928-5e560c06d30e'),
    stock: 18,
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'Axis Smartwatch',
    description:
      'A quietly capable smartwatch with a brushed aluminium case, always-on display and seven-day battery. Tracks movement, sleep and recovery in a minimal interface.',
    category: 'Electronics',
    price: 219,
    originalPrice: null,
    image: image('photo-1523275335684-37898b6baf30'),
    stock: 12,
    isFeatured: true,
    isBestSeller: false,
  },
  {
    name: 'Field Compact Camera',
    description:
      'A pocketable mirrorless camera with a fixed 35mm-equivalent lens, tactile controls and film-inspired colour profiles for everyday documentation.',
    category: 'Electronics',
    price: 649,
    originalPrice: 749,
    image: image('photo-1516035069371-29a1b244cc32'),
    stock: 4,
    isFeatured: false,
    isBestSeller: true,
  },
  {
    name: 'Monolith Bluetooth Speaker',
    description:
      'A low-profile speaker with room-filling sound, an aluminium body and touch controls that disappear into the surface. Twelve hours of playback.',
    category: 'Electronics',
    price: 129,
    originalPrice: null,
    image: image('photo-1608043152269-423dbba4e7e1'),
    stock: 0,
    isFeatured: false,
    isBestSeller: false,
  },
  {
    name: 'Atelier Lounge Chair',
    description:
      'A sculptural lounge chair with a solid oak frame and durable woven upholstery. Built to be repaired, not replaced.',
    category: 'Home & Living',
    price: 890,
    originalPrice: 990,
    image: image('photo-1567538096630-e0c55bd6374c'),
    stock: 6,
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'Halo Table Lamp',
    description:
      'A warm, dimmable table lamp with a powder-coated steel shade and a linen diffuser. Soft light for late dinners and slow mornings.',
    category: 'Home & Living',
    price: 149,
    originalPrice: null,
    image: image('photo-1507473885765-e6ed057f782c'),
    stock: 22,
    isFeatured: false,
    isBestSeller: false,
  },
  {
    name: 'Form Ceramic Vase',
    description:
      'Hand-finished stoneware with a matte glaze and an asymmetric silhouette. Each piece carries subtle variation.',
    category: 'Home & Living',
    price: 68,
    originalPrice: null,
    image: image('photo-1578500494198-246f612d3b3d'),
    stock: 31,
    isFeatured: false,
    isBestSeller: false,
  },
  {
    name: 'Washed Linen Bedding Set',
    description:
      'Stonewashed European flax linen that softens with every wash. Includes a duvet cover and two pillowcases.',
    category: 'Home & Living',
    price: 179,
    originalPrice: 219,
    image: image('photo-1522771739844-6a9f6d5f14af'),
    stock: 3,
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'Everyday Canvas Tote',
    description:
      'A structured canvas tote with leather handles, an interior pocket and enough room for a laptop, a bottle and a book.',
    category: 'Accessories',
    price: 89,
    originalPrice: null,
    image: image('photo-1544816155-12df9643f363'),
    stock: 40,
    isFeatured: false,
    isBestSeller: true,
  },
  {
    name: 'Meridian Sunglasses',
    description:
      'Hand-polished acetate frames with mineral-glass lenses and a rounded-square silhouette. UV400 protection.',
    category: 'Accessories',
    price: 135,
    originalPrice: 165,
    image: image('photo-1511499767150-a48a237f0083'),
    stock: 15,
    isFeatured: false,
    isBestSeller: false,
  },
  {
    name: 'Heritage Field Watch',
    description:
      'A mechanical field watch with a sandblasted steel case, sapphire crystal and a vegetable-tanned leather strap.',
    category: 'Accessories',
    price: 329,
    originalPrice: null,
    image: image('photo-1523170335258-f5ed11844a49'),
    stock: 5,
    isFeatured: true,
    isBestSeller: false,
  },
  {
    name: 'Fold Leather Card Wallet',
    description:
      'Full-grain leather, four card slots and a central note sleeve. Slim enough for a front pocket and made to age well.',
    category: 'Accessories',
    price: 59,
    originalPrice: 75,
    image: image('photo-1627123424574-724758594e93'),
    stock: 54,
    isFeatured: false,
    isBestSeller: false,
  },
  {
    name: 'Court Low Sneakers',
    description:
      'A clean, low-profile sneaker in full-grain leather with a cupsole and recycled laces. An everyday silhouette that works with everything.',
    category: 'Fashion',
    price: 159,
    originalPrice: 189,
    image: image('photo-1542291026-7eec264c27ff'),
    stock: 26,
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'Utility Overshirt',
    description:
      'A heavyweight cotton-twill overshirt with patch pockets and a boxy fit. Layer it open or wear it closed.',
    category: 'Fashion',
    price: 119,
    originalPrice: null,
    image: image('photo-1551028719-00167b16eac5'),
    stock: 8,
    isFeatured: false,
    isBestSeller: false,
  },
  {
    name: 'Cedar & Smoke Eau de Parfum',
    description:
      'An understated fragrance of cedarwood, black pepper and soft smoke. 50ml, blended in small batches.',
    category: 'Lifestyle',
    price: 145,
    originalPrice: null,
    image: image('photo-1541643600914-78b084683601'),
    stock: 9,
    isFeatured: true,
    isBestSeller: false,
  },
  {
    name: 'Grid Notebook Set',
    description:
      'Three thread-bound notebooks with lay-flat pages, a faint grid and recycled board covers. Made for lists, sketches and plans.',
    category: 'Lifestyle',
    price: 32,
    originalPrice: 40,
    image: image('photo-1531346878377-a5be20888e57'),
    stock: 0,
    isFeatured: false,
    isBestSeller: false,
  },
]

const seedProducts = async () => {
  await connectDB()

  let created = 0
  let updated = 0

  for (const product of products) {
    const existing = await Product.findOne({ name: product.name })
    await Product.findOneAndUpdate({ name: product.name }, product, {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
    })
    if (existing) updated += 1
    else created += 1
  }

  console.log(`Products seeded. Created: ${created}, updated: ${updated}.`)
}

seedProducts()
  .catch((error) => {
    console.error(`Product seed failed: ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDB()
  })
