require('dotenv').config();

const { validateEnv, config } = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

// ─── Validate environment variables before anything else ──────────────────────
validateEnv();

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════╗');
      console.log('║         Task Manager API Started             ║');
      console.log('╠══════════════════════════════════════════════╣');
      console.log(`║  Environment : ${config.nodeEnv.padEnd(28)}║`);
      console.log(`║  Port        : ${String(config.port).padEnd(28)}║`);
      console.log(`║  API Base    : http://localhost:${config.port}/api/v1  ║`);
      console.log(`║  API Docs    : http://localhost:${config.port}/api/docs ║`);
      console.log('╚══════════════════════════════════════════════╝');
      console.log('');
    });

    // ─── Graceful Shutdown ──────────────────────────────────────────────────
    const gracefulShutdown = (signal) => {
      console.log(`\n⚠️  ${signal} received — shutting down gracefully...`);
      server.close(async () => {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log('✅ Server and MongoDB connection closed.');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // ─── Unhandled Rejections ───────────────────────────────────────────────
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

    // ─── Uncaught Exceptions ────────────────────────────────────────────────
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err);
      gracefulShutdown('uncaughtException');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
