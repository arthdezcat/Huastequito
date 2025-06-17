const Service = require('../models/Service');

exports.getHomeSlider = async (req, res, next) => {
  try {
    // Trae solo las imágenes de los servicios (máximo 10 para el slider) e incluye el campo _id
    const sliderImages = await Service.find({}, '_id image title').limit(10);
    res.locals.sliderImages = sliderImages;
    next();
  } catch (error) {
    console.error('Error al obtener imágenes para el slider:', error);
    res.locals.sliderImages = [];
    next();
  }
};
