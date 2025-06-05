const HomeInfo = require('../models/HomeInfo');

exports.getHomeInfoPublic = async (req, res, next) => {
  try {
    const homeInfo = await HomeInfo.findOne();
    res.locals.homeInfo = homeInfo;
    next();
  } catch (error) {
    console.error('Error al obtener HomeInfo:', error);
    next();
  }
};
