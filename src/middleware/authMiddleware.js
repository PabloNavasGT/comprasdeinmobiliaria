const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'clave_secreta_super_segura';

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        const cifrado = jwt.verify(token, SECRET_KEY);
        req.usuario = cifrado;
        next();
    } catch (error) {
        res.status(403).json({ success: false, message: 'Token inválido o expirado.' });
    }
};

const esAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Requiere permisos de Administrador.' });
    }
};

module.exports = { verificarToken, esAdmin };