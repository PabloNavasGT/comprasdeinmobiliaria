const mongoose = require('mongoose');

const inmuebleSchema = new mongoose.Schema({
    tipo: { type: String, required: true },
    direccion: { type: String, required: true },
    ciudad: { type: String, required: true },
    departamento: { type: String, required: true },
    pisos: { type: Number, default: 1 },
    area: { type: String, required: true }, // Formato "Frente x Fondo" (____X____)
    operacion: { type: String, enum: ['A la venta', 'Alquilado'], required: true },
    contacto: { type: String, required: true },
    matricula: { type: String },
    propietario: { type: String },
    valor: { type: Number, required: true },
    enganche: { type: Number, default: 0 },
    comercial: { type: Boolean, default: false },
    descripcion: { type: String },
    foto: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Inmueble', inmuebleSchema);