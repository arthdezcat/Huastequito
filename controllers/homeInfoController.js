const HomeInfo = require('../models/HomeInfo');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Mostrar formulario de edición de información de inicio
exports.getHomeInfo = async (req, res) => {
  try {
    let homeInfo = await HomeInfo.findOne();
    // Si no existe, no lo crees aquí, solo envía un objeto vacío para el formulario
    if (!homeInfo) {
      homeInfo = { nombreLocal: '', slogan: '', descripcion: '', telefono: '', direccion: '', email: '', logoUrl: '', iconUrl: '' };
    }
    res.render('admin/homeinfo', { title: 'Editar Inicio', homeInfo });
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
    // Procesar archivos subidos o URLs
    let logoPath = logoUrl;
    let iconPath = iconUrl;

    // Función para procesar imagen circular con fondo transparente
    async function processCircularImage(inputPath, outputPath, size = 160) {
      await sharp(inputPath)
        .resize(size, size)
        .composite([
          {
            input: Buffer.from(
              `<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}"/></svg>`
            ),
            blend: 'dest-in'
          }
        ])
        .png()
        .toFile(outputPath);
    }

    // Procesar logo subido
    if (req.files && req.files['logoFile'] && req.files['logoFile'][0]) {
      const file = req.files['logoFile'][0];
      const inputPath = path.join(__dirname, '../public/uploads', file.filename);
      const outputFile = 'circle-' + file.filename.replace(/\.[^.]+$/, '.png');
      const outputPath = path.join(__dirname, '../public/uploads', outputFile);
      await processCircularImage(inputPath, outputPath, 320); // Logo más grande
      logoPath = '/uploads/' + outputFile;
    } else if (logoUrl && logoUrl.startsWith('http')) {
      // Descargar y procesar logo desde URL
      const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
      const ext = path.extname(logoUrl).split('?')[0] || '.png';
      const fileName = 'logo-' + Date.now() + ext;
      const inputPath = path.join(__dirname, '../public/uploads', fileName);
      fs.writeFileSync(inputPath, response.data);
      const outputFile = 'circle-' + fileName.replace(/\.[^.]+$/, '.png');
      const outputPath = path.join(__dirname, '../public/uploads', outputFile);
      await processCircularImage(inputPath, outputPath, 320);
      logoPath = '/uploads/' + outputFile;
    }

    // Procesar icono subido
    if (req.files && req.files['iconFile'] && req.files['iconFile'][0]) {
      const file = req.files['iconFile'][0];
      const inputPath = path.join(__dirname, '../public/uploads', file.filename);
      const outputFile = 'circle-' + file.filename.replace(/\.[^.]+$/, '.png');
      const outputPath = path.join(__dirname, '../public/uploads', outputFile);
      await processCircularImage(inputPath, outputPath, 96); // Tamaño favicon
      iconPath = '/uploads/' + outputFile;
    } else if (iconUrl && iconUrl.startsWith('http')) {
      // Descargar y procesar icono desde URL
      const response = await axios.get(iconUrl, { responseType: 'arraybuffer' });
      const ext = path.extname(iconUrl).split('?')[0] || '.png';
      const fileName = 'icon-' + Date.now() + ext;
      const inputPath = path.join(__dirname, '../public/uploads', fileName);
      fs.writeFileSync(inputPath, response.data);
      const outputFile = 'circle-' + fileName.replace(/\.[^.]+$/, '.png');
      const outputPath = path.join(__dirname, '../public/uploads', outputFile);
      await processCircularImage(inputPath, outputPath, 96);
      iconPath = '/uploads/' + outputFile;
    } else if (logoPath && !iconUrl) {
      // Si no se subió icono, usar el logo procesado pero en tamaño favicon
      const logoInputPath = path.join(__dirname, '../public', logoPath);
      const outputFile = 'favicon-' + Date.now() + '.png';
      const outputPath = path.join(__dirname, '../public/uploads', outputFile);
      await processCircularImage(logoInputPath, outputPath, 96);
      iconPath = '/uploads/' + outputFile;
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
