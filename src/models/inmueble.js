const { Schema, model } = require('mongoose');

const inmuebleSchema = new Schema({
    tipo: { type: String, required: true, enum: ['Apartamento', 'Casa', 'Oficina', 'Local Comercial', 'Bodega', 'Lote / Terreno', 'Finca'] },
    direccion: { type: String, required: true, trim: true },
    ciudad: { type: String, required: true, trim: true },
    departamento: { type: String, required: true, trim: true },
    pisos: { type: Number, required: true, min: 1, default: 1 },
    area: { type: Number },
    matricula: { type: String, trim: true },
    propietario: { type: String, trim: true },
    valor: { type: Number, required: true, min: 0 },
    comercial: { type: Boolean, default: false },
    descripcion: { type: String },
    foto: { type: String } // Almacena URL o Base64
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('Inmueble', inmuebleSchema);