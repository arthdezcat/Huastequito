const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  productType: { type: String, enum: ['service', 'galeria'], required: true }, // service o galeria
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  image: { type: String, required: true },
  cantidad: { type: Number, default: 1, min: 1 },
  colorSeleccionado: { type: String },
  tallaSeleccionada: { type: String },
  garantia: { type: String },
  // Campos específicos para ofertas
  tipoOferta: { type: String },
  ofertaEspecial: { type: String },
  porcentajeDescuento: { type: Number },
  fechaInicio: { type: Date },
  fechaFin: { type: Date }
});

const cartSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  items: [cartItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware para actualizar la fecha de modificación
cartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método para calcular el total del carrito
cartSchema.methods.getTotal = function() {
  return this.items.reduce((total, item) => {
    return total + (item.price || 0) * item.cantidad;
  }, 0);
};

// Método para obtener el número total de items
cartSchema.methods.getTotalItems = function() {
  return this.items.reduce((total, item) => {
    return total + item.cantidad;
  }, 0);
};

module.exports = mongoose.model('Cart', cartSchema); 