const mongoose = require('mongoose');

const ofertaSchema = new mongoose.Schema({  
  title: { type: String, required: true }, // Nombre de la Oferta
  description: { type: String, required: true }, // Descripción
  tipoOferta: { type: String }, // Tipo de Oferta
  ofertaEspecial: { type: String }, // Oferta Especial (ej: 2x1, 3x2, etc)
  fechaInicio: { type: Date }, // Fecha de Inicio
  fechaFin: { type: Date }, // Fecha de Fin
  porcentajeDescuento: { type: Number }, // Porcentaje de Descuento (%)
  image: { type: String, required: true }, // URL de la Imagen
  // Campos anteriores mantenidos para compatibilidad
  price: { type: Number }, // Precio con oferta aplicada
  precioOriginal: { type: Number }
});

module.exports = mongoose.model('ServiceSecundary', ofertaSchema);