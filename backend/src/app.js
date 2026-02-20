const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const { config } = require('./config/env');
const apiRoutes = require('./routes/index');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// ─── 1. Trust Proxy ──────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// ─── 2. CORS (MUST BE FIRST) ──────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = [
        'https://task-flow-seven-taupe.vercel.app',
        'https://task-flow-seven.vercel.app',
        'https://amitkumar8112.vercel.app',
        ...config.allowedOrigins
      ];
      if (allowed.includes(origin) || origin.includes('localhost') || origin.includes('vercel.app')) {
        return callback(null, true);
      }
      callback(null, false); // Fail silently or handle error
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  })
);

// ─── 3. Body Parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));          
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 🛡️ 4. Data Sanitization (BEFORE Helmet/HPP to avoid mutation conflicts)
// We disable sanitizeQuery because Express 5 makes req.query read-only.
app.use(mongoSanitize({
  sanitizeQuery: false,
}));

// ─── 5. Security & Optimization ───────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(hpp({
  whitelist: ['status', 'priority', 'dueDate', 'tags'] 
}));

app.use(compression());

// ─── 6. Rate Limiting ─────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  message: { success: false, message: 'Rate limit exceeded.' },
  skip: (req) => req.url === '/api/v1/health', 
});
app.use('/api', limiter);

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
