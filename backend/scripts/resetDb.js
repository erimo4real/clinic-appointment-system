/**
 * Script to reset/delete the appointments database
 * Usage: npm run reset-db
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.log('Please make sure .env file exists with MONGODB_URI');
  process.exit(1);
}

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    console.log('📋 Listing collections...');
    const collections = await db.listCollections().toArray();
    
    console.log('Found collections:');
    collections.forEach(c => console.log(`  - ${c.name}`));
    
    // Delete all collections
    console.log('\n🗑️  Deleting all collections...');
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`  Deleted: ${collection.name}`);
    }
    
    console.log('\n✅ Database reset complete!');
    console.log('\n💡 Next step: Run "npm run seed" to repopulate the database');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

resetDatabase();
