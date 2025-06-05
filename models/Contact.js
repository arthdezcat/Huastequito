const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  telefono: { type: String, required: true },
  emailUrl: { type: String },
  whatsappUrl: { type: String },
  facebookUrl: { type: String },
  extraUrl: { type: String },
  footer: { type: String },
  iconColor: { type: String }, // color para el icono
  iconUrl: { type: String }, // url de imagen de icono
  iconFile: { type: String } // nombre de archivo de icono subido
});

module.exports = mongoose.model('Contact', contactSchema);
