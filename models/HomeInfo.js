const mongoose = require('mongoose');

const homeInfoSchema = new mongoose.Schema({
  nombreLocal: { type: String, required: true },
  slogan: { type: String, required: true },
  descripcion: { type: String },
  telefono: { type: String },
  direccion: { type: String },
  email: { type: String },
  logoUrl: { type: String }, // URL o ruta del logo
  iconUrl: { type: String }, // URL o ruta del icono para el favicon
  TituloServicio1: { type: String, default: 'TituloServicio1' },
  TituloServicio2: { type: String, default: 'TituloServicio2' },
  descripcionServicios: { type: String }, // Descripción para la página de servicios
  descripcionGaleria: { type: String }, // Descripción para la página de galería
  descripcionContacto: { type: String }, // Descripción para la página de contacto
  colorFondo: { type: String }, // Color de fondo (hex)
  fondoUrl: { type: String }, // URL de imagen de fondo
  fondoFileUrl: { type: String }, // URL de imagen de fondo subida a Cloudinary
  // Fondos específicos por vista
  fondoInicio: { type: String }, // Fondo específico para la vista de inicio (index.ejs)
  fondoServicios: { type: String }, // Fondo específico para la vista de servicios (services.ejs)
  fondoGaleria: { type: String }, // Fondo específico para la vista de galería (galeri.ejs)
  fondoContacto: { type: String }, // Fondo específico para la vista de contacto (contact.ejs)
  // Puedes agregar más campos según lo que quieras mostrar en la página de inicio
}, { timestamps: true });

module.exports = mongoose.model('HomeInfo', homeInfoSchema);
