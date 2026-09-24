const { MongoClient, ObjectId } = require("mongodb");

const url = process.env.MONGO_URL;
const dbName = process.env.MONGO_DB_NAME || "shriKrishanYadavTractors";
const client = new MongoClient(url);

let dbPromise = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = client.connect().then(() => client.db(dbName));
  }
  return dbPromise;
}

// Mongo documents use _id; the rest of the app works with a plain string `id`.
function serialize(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

module.exports = { getDb, ObjectId, serialize };
