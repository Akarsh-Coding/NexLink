import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoutes from './routes/posts.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9090;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());


app.use(postRoutes);

app.use(express.json());

import dns from 'dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

const start = async () => {
    await mongoose.connect(MONGO_URI);

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

start();