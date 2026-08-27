import dotenv from 'dotenv';
dotenv.config();

import { connectMySQL } from '../config/mysql.js';
import connectDB from '../config/db.js';
import { Product as ProductMySQL, Banner as BannerMySQL, Category as CategoryMySQL, Recipe as RecipeMySQL } from '../models/mysql/index.js';
import Product from '../models/Product.js';
import Banner from '../models/Banner.js';
import Category from '../models/Category.js';
import Recipe from '../models/Recipe.js';
import { saveBase64Image, processImagesArray } from '../utils/fileUpload.js';

export const migrateAllBase64ToFiles = async () => {
  console.log('🚀 Starting Base64 Image to Disk File Migration...');

  await connectMySQL();
  await connectDB().catch(() => console.log('MongoDB connection skipped/failed'));

  let convertedCount = 0;

  // 1. Migrate MySQL Products
  try {
    const sqlProducts = await ProductMySQL.findAll();
    console.log(`📦 Scanning ${sqlProducts.length} MySQL Products...`);
    for (const p of sqlProducts) {
      let updated = false;
      if (p.image && p.image.startsWith('data:image/')) {
        p.image = saveBase64Image(p.image, 'products');
        updated = true;
      }
      if (Array.isArray(p.images) && p.images.some(img => typeof img === 'string' && img.startsWith('data:image/'))) {
        p.images = processImagesArray(p.images, 'products');
        updated = true;
      }
      if (updated) {
        await p.save();
        convertedCount++;
        console.log(`  ✓ Updated MySQL Product ID #${p.id}: ${p.name}`);
      }
    }
  } catch (err) {
    console.error('MySQL Products Migration Error:', err.message);
  }

  // 2. Migrate Mongo Products
  try {
    const mongoProducts = await Product.find().catch(() => []);
    console.log(`📦 Scanning ${mongoProducts.length} Mongo Products...`);
    for (const p of mongoProducts) {
      let updated = false;
      if (p.image && p.image.startsWith('data:image/')) {
        p.image = saveBase64Image(p.image, 'products');
        updated = true;
      }
      if (Array.isArray(p.images) && p.images.some(img => typeof img === 'string' && img.startsWith('data:image/'))) {
        p.images = processImagesArray(p.images, 'products');
        updated = true;
      }
      if (updated) {
        await p.save();
        convertedCount++;
        console.log(`  ✓ Updated Mongo Product #${p._id}: ${p.name}`);
      }
    }
  } catch (err) {
    console.error('Mongo Products Migration Error:', err.message);
  }

  // 3. Migrate MySQL Banners
  try {
    const sqlBanners = await BannerMySQL.findAll();
    console.log(`🎨 Scanning ${sqlBanners.length} MySQL Banners...`);
    for (const b of sqlBanners) {
      let updated = false;
      if (b.image && b.image.startsWith('data:image/')) {
        b.image = saveBase64Image(b.image, 'banners');
        updated = true;
      }
      if (b.desktopImage && b.desktopImage.startsWith('data:image/')) {
        b.desktopImage = saveBase64Image(b.desktopImage, 'banners');
        updated = true;
      }
      if (b.mobileImage && b.mobileImage.startsWith('data:image/')) {
        b.mobileImage = saveBase64Image(b.mobileImage, 'banners');
        updated = true;
      }
      if (updated) {
        await b.save();
        convertedCount++;
        console.log(`  ✓ Updated MySQL Banner ID #${b.id}: ${b.title}`);
      }
    }
  } catch (err) {
    console.error('MySQL Banners Migration Error:', err.message);
  }

  // 4. Migrate Mongo Banners
  try {
    const mongoBanners = await Banner.find().catch(() => []);
    console.log(`🎨 Scanning ${mongoBanners.length} Mongo Banners...`);
    for (const b of mongoBanners) {
      let updated = false;
      if (b.image && b.image.startsWith('data:image/')) {
        b.image = saveBase64Image(b.image, 'banners');
        updated = true;
      }
      if (b.desktopImage && b.desktopImage.startsWith('data:image/')) {
        b.desktopImage = saveBase64Image(b.desktopImage, 'banners');
        updated = true;
      }
      if (b.mobileImage && b.mobileImage.startsWith('data:image/')) {
        b.mobileImage = saveBase64Image(b.mobileImage, 'banners');
        updated = true;
      }
      if (updated) {
        await b.save();
        convertedCount++;
        console.log(`  ✓ Updated Mongo Banner #${b._id}: ${b.title}`);
      }
    }
  } catch (err) {
    console.error('Mongo Banners Migration Error:', err.message);
  }

  // 5. Migrate Categories (MySQL & Mongo)
  try {
    const sqlCategories = await CategoryMySQL.findAll();
    console.log(`🏷️ Scanning ${sqlCategories.length} MySQL Categories...`);
    for (const c of sqlCategories) {
      if (c.image && c.image.startsWith('data:image/')) {
        c.image = saveBase64Image(c.image, 'categories');
        await c.save();
        convertedCount++;
        console.log(`  ✓ Updated MySQL Category ID #${c.id}: ${c.name}`);
      }
    }
    const mongoCategories = await Category.find().catch(() => []);
    for (const c of mongoCategories) {
      if (c.image && c.image.startsWith('data:image/')) {
        c.image = saveBase64Image(c.image, 'categories');
        await c.save();
        convertedCount++;
        console.log(`  ✓ Updated Mongo Category #${c._id}: ${c.name}`);
      }
    }
  } catch (err) {
    console.error('Categories Migration Error:', err.message);
  }

  // 6. Migrate Recipes (MySQL & Mongo)
  try {
    const sqlRecipes = await RecipeMySQL.findAll();
    console.log(`📖 Scanning ${sqlRecipes.length} MySQL Recipes...`);
    for (const r of sqlRecipes) {
      if (r.image && r.image.startsWith('data:image/')) {
        r.image = saveBase64Image(r.image, 'recipes');
        await r.save();
        convertedCount++;
        console.log(`  ✓ Updated MySQL Recipe ID #${r.id}: ${r.title}`);
      }
    }
    const mongoRecipes = await Recipe.find().catch(() => []);
    for (const r of mongoRecipes) {
      if (r.image && r.image.startsWith('data:image/')) {
        r.image = saveBase64Image(r.image, 'recipes');
        await r.save();
        convertedCount++;
        console.log(`  ✓ Updated Mongo Recipe #${r._id}: ${r.title}`);
      }
    }
  } catch (err) {
    console.error('Recipes Migration Error:', err.message);
  }

  console.log(`✅ Base64 Image Migration Complete! Total items converted to disk files: ${convertedCount}`);
};

// Run directly if invoked from CLI
if (process.argv[1] && process.argv[1].endsWith('migrateBase64ToFiles.js')) {
  migrateAllBase64ToFiles().then(() => process.exit(0)).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
