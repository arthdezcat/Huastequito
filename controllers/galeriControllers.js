const ServiceSecundary = require('../models/Galeria'); // Antes ComputadoraLaptop
const path = require('path');
const { cloudinary } = require('../middlewares/cloudinary');

// Obtener todas las ofertas
exports.getGaleria = async (req, res) => {
  try {
    const computadoras = await ServiceSecundary.find();
    res.render('pages/galeri', { galeria: computadoras, homeInfo: res.locals.homeInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener las ofertas');
  }
};

// Obtener solo las imágenes de galería para el slider de ofertas en home
exports.getGaleriaImages = async (req, res, next) => {
  try {
    const galeriaImages = await ServiceSecundary.find({}, 'image title');
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
    if (req.file && req.file.path) {
      image = req.file.path; // URL de Cloudinary
    }
    const { title, description, tipoOferta, ofertaEspecial, fechaInicio, fechaFin, porcentajeDescuento, price, garantia } = req.body;
    
    const newComputadora = new ServiceSecundary({
      title,
      description,
      tipoOferta,
      ofertaEspecial,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      porcentajeDescuento: porcentajeDescuento || undefined,
      price: price || undefined,
      garantia,
      image
    });
    await newComputadora.save();
    res.redirect('/admin/galeria');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al agregar el registro');
  }
};

// Actualizar una oferta
exports.updateGaleria = async (req, res) => {
  try {
    const { id } = req.params;
    let image = req.body.image;
    const galeria = await ServiceSecundary.findById(id);
    if (req.file && req.file.path) {
      image = req.file.path;
      if (galeria && galeria.image && galeria.image.includes('cloudinary.com')) {
        const publicId = galeria.image.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy('webservitec/' + publicId);
      }
    }
    const { title, description, tipoOferta, ofertaEspecial, fechaInicio, fechaFin, porcentajeDescuento, price, garantia } = req.body;
    
    await ServiceSecundary.findByIdAndUpdate(id, {
      title,
      description,
      tipoOferta,
      ofertaEspecial,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      porcentajeDescuento: porcentajeDescuento || undefined,
      price: price || undefined,
      garantia,
      image
    });
    res.redirect('/admin/galeria');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar el registro');
  }
};

// Eliminar una oferta
exports.deleteGaleria = async (req, res) => {
  try {
    const { id } = req.params;
    const galeria = await ServiceSecundary.findById(id);
    if (galeria && galeria.image && galeria.image.includes('cloudinary.com')) {
      const publicId = galeria.image.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy('webservitec/' + publicId);
    }
    await ServiceSecundary.findByIdAndDelete(id);
    res.redirect('/admin/galeria');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar la oferta');
  }
};