const { Router } = require('express');
const { 
    obtenerInmuebles, 
    crearInmueble, 
    eliminarInmueble 
} = require('../controllers/inmuebleController');

const router = Router();

router.get('/', obtenerInmuebles);
router.post('/', crearInmueble);
router.delete('/:id', eliminarInmueble);

module.exports = router;