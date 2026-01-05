import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRoutes from './routes/api';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { AppError } from './utils/AppError';
import { StatusCodes } from 'http-status-codes';
import { User } from './models/User';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(cors());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting
app.use('/api', apiLimiter);

// Body Parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('AI Flow API is running');
});

// 404 Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, StatusCodes.NOT_FOUND));
});

// Global Error Handler
app.use(errorHandler);

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-flow-app';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Seed Demo Users
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({ username: 'admin', password: hashedPassword, role: 'admin' });
      console.log('Admin user created');
    }

    const userExists = await User.findOne({ username: 'user' });
    if (!userExists) {
      const hashedPassword = await bcrypt.hash('user123', 12);
      await User.create({ username: 'user', password: hashedPassword, role: 'user' });
      console.log('Demo user created');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
