const Inmueble = require('../models/inmueble');

// Obtener todos los inmuebles (con filtros opcionales)
const obtenerInmuebles = async (req, res) => {
    try {
        const { tipo, ciudad } = req.query;
        const filtro = {};
        
        if (tipo) filtro.tipo = tipo;
        if (ciudad) filtro.ciudad = new RegExp(ciudad, 'i');

        const inmuebles = await Inmueble.find(filtro).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: inmuebles.length, data: inmuebles });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener inmuebles', error: error.message });
    }
};

// Crear un nuevo inmueble
const crearInmueble = async (req, res) => {
    try {
        const nuevoInmueble = new Inmueble(req.body);
        const inmuebleGuardado = await nuevoInmueble.save();
        res.status(201).json({ success: true, data: inmuebleGuardado });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Datos inválidos para el registro', error: error.message });
    }
};

// Eliminar un inmueble
const eliminarInmueble = async (req, res) => {
    try {
        const { id } = req.params;
        const inmuebleEliminado = await Inmueble.findByIdAndDelete(id);
        
        if (!inmuebleEliminado) {
            return res.status(404).json({ success: false, message: 'Inmueble no encontrado' });
        }

        res.status(200).json({ success: true, message: 'Inmueble demolido / eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar el inmueble', error: error.message });
    }
};

module.exports = {
    obtenerInmuebles,
    crearInmueble,
    eliminarInmueble
};