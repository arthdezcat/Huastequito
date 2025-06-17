const Service = require('../models/Service');
const path = require('path');
const { cloudinary } = require('../middlewares/uploadImage');

// Obtener todos los servicios
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();

    // Asegurar que todas las imágenes tengan un atributo data-id, incluso si son URLs externas
    const servicesConIds = services.map(service => ({
      ...service._doc,
      dataId: service._id.toString(),
    }));

    res.render('pages/services', { services: servicesConIds, homeInfo: res.locals.homeInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los servicios');
  }
};

// Añadir un nuevo servicio
exports.addService = async (req, res) => {
  try {
    let image = req.body.image;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      image = result.secure_url;
    }
    const { title, description, price, cantidad, colores, tallas } = req.body;
    const coloresArray = colores ? colores.split(',').map(c => c.trim()) : [];
    const tallasArray = tallas ? tallas.split(',').map(t => t.trim()) : [];
    const newService = new Service({
      title,
      description,
      price,
      image,
      cantidad,
      colores: coloresArray,
      tallas: tallasArray
    });
    await newService.save();
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
    const service = await Service.findById(id);
    let image = req.body.image;
    if (req.file) {
      if (service.image) {
        const publicId = service.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const result = await cloudinary.uploader.upload(req.file.path);
      image = result.secure_url;
    }
    const { title, description, price, cantidad, colores, tallas } = req.body;
    const coloresArray = colores ? colores.split(',').map(c => c.trim()) : [];
    const tallasArray = tallas ? tallas.split(',').map(t => t.trim()) : [];
    await Service.findByIdAndUpdate(id, {
      title,
      description,
      price,
      image,
      cantidad,
      colores: coloresArray,
      tallas: tallasArray
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
    const service = await Service.findById(id);
    if (service.image) {
      const publicId = service.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await Service.findByIdAndDelete(id);
    res.redirect('/admin/services');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar el servicio');
  }
};
