const HomeInfo = require('../models/HomeInfo');
const { cloudinary } = require('../middlewares/uploadImage');

// Mostrar formulario de edición de información de inicio
exports.getHomeInfo = async (req, res) => {
  try {
    let homeInfo = await HomeInfo.findOne();
    // Si no existe, no lo crees aquí, solo envía un objeto vacío para el formulario
    if (!homeInfo) {
      homeInfo = { nombreLocal: '', slogan: '', descripcion: '', telefono: '', direccion: '', email: '', logoUrl: '', iconUrl: '' };
    }
    res.render('admin/index', { title: 'Editar Inicio', homeInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener la información de inicio');
  }
};

// Actualizar información de inicio
exports.updateHomeInfo = async (req, res) => {
  try {
    const { nombreLocal, slogan, descripcion, telefono, direccion, email, logoUrl, iconUrl } = req.body;
    let homeInfo = await HomeInfo.findOne();

    let logoPath = logoUrl;
    let iconPath = iconUrl;

    // Procesar logo subido
    if (req.files && req.files['logoFile'] && req.files['logoFile'][0]) {
      const file = req.files['logoFile'][0];
      if (homeInfo && homeInfo.logoUrl) {
        const publicId = homeInfo.logoUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const result = await cloudinary.uploader.upload(file.path, { folder: 'logos' });
      logoPath = result.secure_url;
    }

    // Procesar icono subido
    if (req.files && req.files['iconFile'] && req.files['iconFile'][0]) {
      const file = req.files['iconFile'][0];
      if (homeInfo && homeInfo.iconUrl) {
        const publicId = homeInfo.iconUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const result = await cloudinary.uploader.upload(file.path, { folder: 'icons' });
      iconPath = result.secure_url;
    }

    if (!homeInfo) {
      homeInfo = new HomeInfo({ nombreLocal, slogan, descripcion, telefono, direccion, email, logoUrl: logoPath, iconUrl: iconPath });
    } else {
      homeInfo.nombreLocal = nombreLocal;
      homeInfo.slogan = slogan;
      homeInfo.descripcion = descripcion;
      homeInfo.telefono = telefono;
      homeInfo.direccion = direccion;
      homeInfo.email = email;
      homeInfo.logoUrl = logoPath;
      homeInfo.iconUrl = iconPath;
    }
    await homeInfo.save();
    res.redirect('/admin/homeinfo');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar la información de inicio');
  }
};
