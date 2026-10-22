const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'clave_secreta_super_segura';

const registrar = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        const existeUsuario = await User.findOne({ email });
        if (existeUsuario) {
            return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = new User({
            nombre,
            email,
            password: hashedPassword,
            rol: rol || 'user'
        });

        await nuevoUsuario.save();
        res.status(201).json({ success: true, message: '¡Usuario registrado con éxito!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al registrar usuario', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
        }

        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) {
            return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol, nombre: usuario.nombre },
            SECRET_KEY,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            success: true,
            token,
            usuario: { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al iniciar sesión', error: error.message });
    }
};

module.exports = { registrar, login };