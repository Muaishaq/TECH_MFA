const app = require('./src/app');
const prisma = require('./src/config/db');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 TECH_MFA Server running on port ${PORT}`);
  
  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
});