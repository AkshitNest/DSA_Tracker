const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in .env.local');
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db();
    const collection = db.collection('company_questions');

    const filePath = path.join(__dirname, '..', 'data', 'company-questions.json');
    if (!fs.existsSync(filePath)) {
      console.error('Data file not found at:', filePath);
      return;
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);

    console.log('Clearing existing company data...');
    await collection.deleteMany({});

    console.log('Preparing data for migration...');
    const documents = Object.keys(data).map(companyName => ({
      name: companyName,
      questions: data[companyName],
      updatedAt: new Date()
    }));

    console.log(`Migrating ${documents.length} companies to MongoDB...`);
    
    // Batch insert to avoid size limits
    const batchSize = 100;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      await collection.insertMany(batch);
      console.log(`Uploaded batch ${Math.floor(i / batchSize) + 1}...`);
    }

    console.log('Migration completed successfully! 🎉');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrate();
