const { MongoClient } = require("mongodb");

const database = module.exports;

database.connect = async function connect() {
  // database.client = new MongoClient('mongodb://root:1234@database:27017/');
  database.client = new MongoClient("mongodb://docker:mongopw@localhost:55000");
  await database.client.connect();
};
