import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

async function start() {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });

  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/xenopilot';
    await mongoose.connect(uri);
    console.log(`✅ Connected to MongoDB at ${uri === process.env.MONGO_URI ? 'Atlas' : 'Local'}`);
  } catch (err) {
    console.error('❌ Database connection failed', err);
  }
}

start();
