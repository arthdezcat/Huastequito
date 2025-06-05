const mongoose = require('mongoose');

const ofertaSchema = new mongoose.Schema({  
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  tipo: { type: String, required: true }, // semanal, mensual, descuento, 2x1, etc.
  fechaInicio: { type: Date },
  fechaFin: { type: Date },
  porcentaje: { type: Number }, // porcentaje de descuento si aplica
  especial: { type: String }, // para ofertas como 2x1, 3x2, etc.
});

module.exports = mongoose.model('Oferta', ofertaSchema);