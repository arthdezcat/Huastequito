const Oferta = require('../models/Galeria'); // Ahora es Oferta
const path = require('path');

// Obtener todas las ofertas
exports.getGaleria = async (req, res) => {
  try {
    const galeria = await Oferta.find();
    res.render('pages/galeri', { galeria, homeInfo: res.locals.homeInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener las ofertas');
  }
};

// Añadir una nueva oferta
exports.addGaleria = async (req, res) => {
  try {
    let image = req.body.image;
    if (req.file) {
      image = '/uploads/' + req.file.filename;
    }
    const { title, description, tipo, fechaInicio, fechaFin, porcentaje, especial } = req.body;
    const newOferta = new Oferta({ title, description, image, tipo, fechaInicio, fechaFin, porcentaje, especial });
    await newOferta.save();
    res.redirect('/admin/galeria');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al agregar la oferta');
  }
};

// Actualizar una oferta
exports.updateGaleria = async (req, res) => {
  try {
    const { id } = req.params;
    let image = req.body.image;
    if (req.file) {
      image = '/uploads/' + req.file.filename;
    }
    const { title, description, tipo, fechaInicio, fechaFin, porcentaje, especial } = req.body;
    await Oferta.findByIdAndUpdate(id, { title, description, image, tipo, fechaInicio, fechaFin, porcentaje, especial });
    res.redirect('/admin/galeria');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar la oferta');
  }
};

// Eliminar una oferta
exports.deleteGaleria = async (req, res) => {
  try {
    const { id } = req.params;
    await Oferta.findByIdAndDelete(id);
    res.redirect('/admin/galeria');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar la oferta');
  }
};