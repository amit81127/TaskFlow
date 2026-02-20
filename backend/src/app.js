const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const { config } = require('./config/env');
const apiRoutes = require('./routes/index');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// ─── Trust Proxy ──────────────────────────────────────────────────────────────
// Essential for Render/Vercel/Heroku to get correct IP and protocol
app.set('trust proxy', 1);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Must come before helmet and routes to handle preflight (OPTIONS) correctly
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (config.isDev && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Explicitly allow the user's specific vercel app if origins are messed up in env
      if (origin === 'https://task-flow-seven-taupe.vercel.app') {
        return callback(null, true);
      }

      if (config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Production Middleware ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));          // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Request Logger ───────────────────────────────────────────────────────────
if (config.isDev) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
} else {
  // Production logging: minimal but informative
  app.use((req, res, next) => {
    if (req.url !== '/api/v1/health') {
      console.log(`[PROD] ${req.method} ${req.url} - ${req.ip}`);
    }
    next();
  });
}

// ─── Swagger Docs ─────────────────────────────────────────────────────────────
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../swagger/swagger.yaml'));
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'Task Manager API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );
  console.log('📄 Swagger docs available at /api/docs');
} catch (err) {
  console.warn('⚠️  swagger.yaml not found — Swagger UI disabled.');
}

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', apiRoutes);

// ─── Root Endpoint ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Task Manager API',
    docs: '/api/docs',
    health: '/api/v1/health',
    version: 'v1',
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
