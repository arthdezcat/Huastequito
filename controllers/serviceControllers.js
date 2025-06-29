const ServicePrincipali = require('../models/Service');
const path = require('path');
const { cloudinary } = require('../middlewares/cloudinary');

// Obtener todos los servicios
exports.getServices = async (req, res) => {
  try {
    const celulares = await ServicePrincipali.find();
    res.render('pages/services', { services: celulares, homeInfo: res.locals.homeInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los servicios');
  }
};

// Añadir un nuevo servicio
exports.addService = async (req, res) => {
  try {
    let image = req.body.image;
    if (req.file && req.file.path) {
      image = req.file.path; // URL de Cloudinary
    }
    const { title, description, price, cantidadDisponible, colores, tallas, garantia } = req.body;
    
    // Procesar colores y tallas (convertir strings separados por coma en arrays)
    const coloresArray = colores ? colores.split(',').map(color => color.trim()).filter(color => color) : [];
    const tallasArray = tallas ? tallas.split(',').map(talla => talla.trim()).filter(talla => talla) : [];
    
    const newCelular = new ServicePrincipali({
      title,
      description,
      price: price || undefined,
      cantidadDisponible: cantidadDisponible || undefined,
      colores: coloresArray,
      tallas: tallasArray,
      garantia,
      image
    });
    await newCelular.save();
    res.redirect('/admin/services');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al agregar el servicio');
  }
};

// Actualizar un servicio
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    let image = req.body.image;
    const servicio = await ServicePrincipali.findById(id);
    if (req.file && req.file.path) {
      image = req.file.path;
      if (servicio && servicio.image && servicio.image.includes('cloudinary.com')) {
        const publicId = servicio.image.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy('webservitec/' + publicId);
      }
    }
    const { title, description, price, cantidadDisponible, colores, tallas, garantia } = req.body;
    
    // Procesar colores y tallas (convertir strings separados por coma en arrays)
    const coloresArray = colores ? colores.split(',').map(color => color.trim()).filter(color => color) : [];
    const tallasArray = tallas ? tallas.split(',').map(talla => talla.trim()).filter(talla => talla) : [];
    
    await ServicePrincipali.findByIdAndUpdate(id, {
      title,
      description,
      price: price || undefined,
      cantidadDisponible: cantidadDisponible || undefined,
      colores: coloresArray,
      tallas: tallasArray,
      garantia,
      image
    });
    res.redirect('/admin/services');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar el servicio');
  }
};

// Eliminar un servicio
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await ServicePrincipali.findById(id);
    if (servicio && servicio.image && servicio.image.includes('cloudinary.com')) {
      const publicId = servicio.image.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy('webservitec/' + publicId);
    }
    await ServicePrincipali.findByIdAndDelete(id);
    res.redirect('/admin/services');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar el servicio');
  }
};
