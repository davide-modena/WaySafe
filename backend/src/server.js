require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`WaySafe API in ascolto sulla porta ${PORT}`);
    });
  } catch (err) {
    console.error('Avvio fallito:', err.message);
    process.exit(1);
  }
}

start();
