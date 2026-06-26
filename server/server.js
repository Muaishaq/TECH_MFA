const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 TECH_MFA Server running on port ${PORT}`);
});