import { createApp } from './app';
import { connectDB } from './config/db';
import { config } from './config/env';

const startServer = async () => {
  const app = createApp();

  // Connect to Database
  let dbConnected = await connectDB();
  if (!dbConnected) {
    console.log('[MongoDB] Standard connection unavailable. Starting embedded in-memory database for local development...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      dbConnected = await connectDB(inMemoryUri);
      if (dbConnected) {
        console.log('[MongoDB] In-memory database started. Seeding demo internships, jobs, and accounts...');
        const { seedDatabase } = await import('./utils/seedData');
        await seedDatabase();
        console.log('✅ [MongoDB] Embedded development database ready with preloaded data!');
      }
    } catch (err: any) {
      console.warn('⚠️ [MongoDB] Could not start in-memory database:', err.message);
    }
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
