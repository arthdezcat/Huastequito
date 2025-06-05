const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true }, // URL o nombre de archivo de la imagen
  cantidad: { type: Number, required: true, default: 0 }, // Cantidad disponible
  colores: [{ type: String }], // Colores disponibles
  tallas: [{ type: String }], // Tallas disponibles
});

module.exports = mongoose.model('Service', serviceSchema);
