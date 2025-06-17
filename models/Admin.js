const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'editor', 'lector'],
    default: 'admin',
    required: true
  },
  permissions: {
    type: [String],
    enum: ['read', 'write', 'edit', 'delete'],
    default: ['read'],
  }
});

// Middleware para encriptar la contraseña antes de guardarla
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Método para verificar la contraseña
adminSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Método estático para encriptar contraseñas
adminSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('Admin', adminSchema);
