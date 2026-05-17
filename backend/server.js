require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>HealthPulse Backend</title>
        <style>
          body{margin:0;background:#020617;color:white;font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column}
          h1{color:#38bdf8;font-size:48px;margin:0}
          p{color:#cbd5e1;font-size:20px;margin-top:12px}
        </style>
      </head>
      <body>
        <h1>HealthPulse AI Backend Running</h1>
        <p>Backend Connected Successfully</p>
      </body>
    </html>
  `);
});

const start = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down');
      server.close(() => process.exit(0));
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

if (require.main === module) start();

module.exports = app;