process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-waysafe';
process.env.JWT_EXPIRES_IN = '1h';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const nome of Object.keys(collections)) {
    await collections[nome].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
