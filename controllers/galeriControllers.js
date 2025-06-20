const Oferta = require('../models/Galeria'); // Ahora es Oferta
const path = require('path');
const { cloudinary } = require('../middlewares/uploadImage');

// Obtener todas las ofertas
exports.getGaleria = async (req, res) => {
  try {
    const { imageId } = req.query; // Obtener el parámetro imageId de la URL
    const galeria = await Oferta.find();
    let selectedOferta = null;

    if (imageId) {
      selectedOferta = await Oferta.findById(imageId); // Buscar la oferta específica
    }

    // Asegurar que todas las imágenes tengan un atributo data-id, incluso si son URLs externas
    const galeriaConIds = galeria.map(oferta => ({
      ...oferta._doc,
      dataId: oferta._id.toString(),
    }));

    res.render('pages/galeri', { galeria: galeriaConIds, selectedOferta, homeInfo: res.locals.homeInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener las ofertas');
  }
};

// Obtener solo las imágenes de galería para el slider de ofertas en home
exports.getGaleriaImages = async (req, res, next) => {
  try {
    // Incluir el campo _id en la consulta para generar correctamente el atributo data-id
    const galeriaImages = await Oferta.find({}, '_id image title');
    res.locals.galeriaImages = galeriaImages;
    next();
  } catch (error) {
    console.error('Error al obtener imágenes de galería:', error);
    res.locals.galeriaImages = [];
    next();
  }
};

// Añadir una nueva oferta
exports.addGaleria = async (req, res) => {
  try {
    let image = req.body.image;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'galeria' });
      image = result.secure_url;
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
    const oferta = await Oferta.findById(id);
    let image = req.body.image;
    if (req.file) {
      if (oferta.image) {
        const publicId = oferta.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'galeria' });
      image = result.secure_url;
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
    const oferta = await Oferta.findById(id);
    if (oferta.image) {
      const publicId = oferta.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await Oferta.findByIdAndDelete(id);
    res.redirect('/admin/galeria');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar la oferta');
  }
};