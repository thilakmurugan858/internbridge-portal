import { createApp } from './app';
import { connectDB } from './config/db';
import { config } from './config/env';

const startServer = async () => {
  const app = createApp();

  // Connect to Database
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.warn('\n⚠️ [InternBridge Server Warning]');
    console.warn('MongoDB is currently unreachable. Database dependent queries will fail.');
    console.warn('To start local MongoDB or use Atlas:');
    console.warn('1. Set MONGODB_URI in backend/.env');
    console.warn('2. Run `npm run seed` to load sample internships, jobs, and accounts.\n');
  }

  const server = app.listen(config.port, () => {
    console.log(`🚀 [InternBridge Backend API] Server running on http://localhost:${config.port}`);
    console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
    console.log(`⚡ Environment: ${config.nodeEnv}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
