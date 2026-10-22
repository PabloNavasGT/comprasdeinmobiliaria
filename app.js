const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/database');
const inmuebleRoutes = require('./src/routes/inmuebleRoutes');
const authRoutes = require('./src/routes/authRoutes');
const app = express();

// Conectar a Base de Datos
connectDB();

// Middlewares
// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Primero se configura para procesar JSON

// Archivos estáticos y Rutas de la API
app.use(express.static(path.join(__dirname))); 
app.use('/api/auth', authRoutes);
app.use('/api/inmuebles', inmuebleRoutes);


module.exports = app;