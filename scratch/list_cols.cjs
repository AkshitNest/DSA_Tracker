const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://sharmaakshit495_db_user:0l2jW9FtpfUcOrv8@cluster0.jivn0hc.mongodb.net/DSA_Tracker?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('DSA_Tracker');
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        for (const colName of collections.map(c => c.name)) {
            const count = await db.collection(colName).countDocuments();
            console.log(`${colName}: ${count}`);
            if (count > 0) {
                const doc = await db.collection(colName).findOne({});
                console.log(`Sample from ${colName}:`, JSON.stringify(doc, null, 2).substring(0, 500));
            }
        }
    } finally {
        await client.close();
    }
}

main().catch(console.error);
