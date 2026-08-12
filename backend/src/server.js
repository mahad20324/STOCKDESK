const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const { sequelize, initAppData } = require('./models');

const PORT = process.env.PORT || 4000;

// Railway health check
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'StockDesk backend'
  });
});

async function runMigrations() {
  // Add 'Split' to paymentMethod enum if it doesn't exist yet
  // Sequelize alter:true cannot add values to existing PostgreSQL ENUMs
  await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'enum_sales_paymentMethod'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'Split'
          AND enumtypid = (
            SELECT oid
            FROM pg_type
            WHERE typname = 'enum_sales_paymentMethod'
          )
      ) THEN
        ALTER TYPE "enum_sales_paymentMethod" ADD VALUE 'Split';
      END IF;
    END $$;
  `).catch(() => {});
}

async function start() {
  try {
    await sequelize.authenticate();
    await runMigrations();
    await sequelize.sync({ alter: true });
    await initAppData();

    // Start HTTP server immediately so platform healthchecks succeed.
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`StockDesk backend running on port ${PORT}`);
    });

    // Initialize database asynchronously. Failures will be logged but
    // will not stop the process so the container can become healthy.
    try {
      await sequelize.authenticate();
      await runMigrations();
      await sequelize.sync({ alter: true });
      await initAppData();
      console.log('Database initialized');
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
}

start();