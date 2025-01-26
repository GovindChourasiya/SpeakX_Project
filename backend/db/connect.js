const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const uri = process.env.MONGODB_URI;

const connectToDatabase = async () => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to the Database");
    return client;
  } catch (err) {
    console.error("Error connecting to the Database:", err);
    throw err;
  }
};

module.exports = { connectToDatabase };
