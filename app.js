const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/database');
const inmuebleRoutes = require('./src/routes/inmuebleRoutes');

const app = express();

// Conectar a Base de Datos
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Servir archivos estáticos del frontend (index.html, style.css, etc.)
app.use(express.static(path.join(__dirname))); 

// Rutas de la API
app.use('/api/inmuebles', inmuebleRoutes);

module.exports = app;