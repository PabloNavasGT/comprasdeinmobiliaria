const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['admin', 'user'], default: 'user' }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('User', userSchema);