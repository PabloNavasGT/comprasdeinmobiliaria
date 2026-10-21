const { Router } = require('express');
const { obtenerInmuebles, crearInmueble, eliminarInmueble } = require('../controllers/inmuebleController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');
const router = Router();

router.get('/', obtenerInmuebles); // Cualquiera puede ver
router.post('/', verificarToken, esAdmin, crearInmueble); // Solo Admin
router.delete('/:id', verificarToken, esAdmin, eliminarInmueble); // Solo Admin

module.exports = router;