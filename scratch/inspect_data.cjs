const { MongoClient } = require('mongodb');

async function main() {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/dsa-tracker";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('dsa-tracker');
        const coll = db.collection('company_questions');
        const doc = await coll.findOne({});
        console.log(JSON.stringify(doc, null, 2));
    } finally {
        await client.close();
    }
}

main().catch(console.error);
