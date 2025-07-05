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
    const { title, description, tipoOferta, ofertaEspecial, fechaInicio, fechaFin, porcentajeDescuento, precioOriginal, garantia } = req.body;
    
    // Calcular precio con oferta aplicada
    let precioConOferta = parseFloat(precioOriginal) || 0;
    
    // Si hay porcentaje de descuento y es mayor a 0, se aplica SOLO el descuento
    if (porcentajeDescuento && parseFloat(porcentajeDescuento) > 0) {
      const descuento = parseFloat(porcentajeDescuento) / 100;
      precioConOferta = precioConOferta * (1 - descuento);
    } else if (ofertaEspecial) {
      // Si NO hay porcentaje de descuento pero sí oferta especial, se aplica SOLO la oferta especial
      const ofertaMatch = ofertaEspecial.match(/(\d+)x(\d+)/);
      if (ofertaMatch) {
        const cantidadOferta = parseInt(ofertaMatch[1]);
        const cantidadPaga = parseInt(ofertaMatch[2]);
        if (cantidadOferta > cantidadPaga) {
          // El precio final es el precio por la cantidad que paga
          precioConOferta = precioConOferta * cantidadPaga;
        }
      }
    }
    
    const newComputadora = new ServiceSecundary({
      title,
      description,
      tipoOferta,
      ofertaEspecial,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      porcentajeDescuento: porcentajeDescuento || undefined,
      precioOriginal: parseFloat(precioOriginal) || 0,
      price: precioConOferta, // Precio con oferta aplicada
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
    const { title, description, tipoOferta, ofertaEspecial, fechaInicio, fechaFin, porcentajeDescuento, precioOriginal, garantia } = req.body;
    
    // Calcular precio con oferta aplicada
    let precioConOferta = parseFloat(precioOriginal) || 0;
    
    // Si hay porcentaje de descuento y es mayor a 0, se aplica SOLO el descuento
    if (porcentajeDescuento && parseFloat(porcentajeDescuento) > 0) {
      const descuento = parseFloat(porcentajeDescuento) / 100;
      precioConOferta = precioConOferta * (1 - descuento);
    } else if (ofertaEspecial) {
      // Si NO hay porcentaje de descuento pero sí oferta especial, se aplica SOLO la oferta especial
      const ofertaMatch = ofertaEspecial.match(/(\d+)x(\d+)/);
      if (ofertaMatch) {
        const cantidadOferta = parseInt(ofertaMatch[1]);
        const cantidadPaga = parseInt(ofertaMatch[2]);
        if (cantidadOferta > cantidadPaga) {
          // El precio final es el precio por la cantidad que paga
          precioConOferta = precioConOferta * cantidadPaga;
        }
      }
    }
    
    await ServiceSecundary.findByIdAndUpdate(id, {
      title,
      description,
      tipoOferta,
      ofertaEspecial,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      porcentajeDescuento: porcentajeDescuento || undefined,
      precioOriginal: parseFloat(precioOriginal) || 0,
      price: precioConOferta, // Precio con oferta aplicada
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