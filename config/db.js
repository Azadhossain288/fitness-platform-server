const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db('fitnessPlatformDB'); // আপনার ডাটাবেজের নাম
    console.log('✅ MongoDB Connected successfully!');
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

function getCollections() {
  if (!db) {
    // যদি কোনো কারণে কানেকশনের আগেই কালেকশন খোঁজে, ক্র্যাশ এড়ানোর জন্য ডাটাবেজ অবজেক্ট ইনিশিয়েট করা
    db = client.db('fitnessPlatformDB');
  }
  return {
    usersCollection: db.collection('users'),
    classesCollection: db.collection('classes'),
    bookingsCollection: db.collection('bookings'),
    favoritesCollection: db.collection('favorites'),
    trainerApplicationsCollection: db.collection('trainerApplications'),
    forumPostsCollection: db.collection('forumPosts'),
    commentsCollection: db.collection('comments'),
    paymentsCollection: db.collection('payments'),
  };
}

module.exports = { connectDB, getCollections, client };