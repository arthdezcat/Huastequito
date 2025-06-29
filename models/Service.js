const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Nombre del Producto
  description: { type: String, required: true }, // Descripción
  price: { type: Number }, // Precio
  cantidadDisponible: { type: Number }, // Cantidad disponible
  colores: [{ type: String }], // Colores (array de strings)
  tallas: [{ type: String }], // Tallas (array de strings)
  image: { type: String, required: true }, // URL de la Imagen
  // Campo anterior mantenido para compatibilidad
  garantia: { type: String }
});

module.exports = mongoose.model('ServicePrincipali', serviceSchema);
