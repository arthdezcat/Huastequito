const HomeInfo = require('../models/HomeInfo');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { cloudinary } = require('../middlewares/cloudinary');

// Redirige a la vista principal de admin si se intenta acceder a /admin/homeinfo directamente
exports.getHomeInfo = async (req, res) => {
  try {
    let homeInfo = await HomeInfo.findOne();
    if (!homeInfo) {
      homeInfo = { nombreLocal: '', slogan: '', descripcion: '', telefono: '', direccion: '', email: '', logoUrl: '', iconUrl: '' };
    }
    // Renderiza la vista principal de admin (index.ejs) en vez de una vista inexistente
    res.render('admin/index', { title: 'Editar Inicio', homeInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener la información de inicio');
  }
};

// Actualizar información de inicio
exports.updateHomeInfo = async (req, res) => {
  try {
    const { nombreLocal, slogan, descripcion, telefono, direccion, email, logoUrl, iconUrl, TituloServicio1, TituloServicio2, descripcionServicios, descripcionGaleria, descripcionContacto, colorFondo, fondoUrl } = req.body;
    let homeInfo = await HomeInfo.findOne();
    // Procesar archivos subidos o URLs
    let logoPath = logoUrl;
    let iconPath = iconUrl;
    let fondoFilePath = null; // Nuevo: para la imagen de fondo individual
    
    // Procesar imágenes de fondo por vista específica
    let fondoInicio = null;
    let fondoServicios = null;
    let fondoGaleria = null;
    let fondoContacto = null;

    // Procesar fondo para la vista de Inicio
    if (req.files && req.files['fondoInicio'] && req.files['fondoInicio'][0]) {
      const file = req.files['fondoInicio'][0];
      if (file.path && file.path.includes('cloudinary.com')) {
        fondoInicio = file.path;
      } else if (file.url) {
        fondoInicio = file.url;
      }
    }

    // Procesar fondo para la vista de Servicios
    if (req.files && req.files['fondoServicios'] && req.files['fondoServicios'][0]) {
      const file = req.files['fondoServicios'][0];
      if (file.path && file.path.includes('cloudinary.com')) {
        fondoServicios = file.path;
      } else if (file.url) {
        fondoServicios = file.url;
      }
    }

    // Procesar fondo para la vista de Galería
    if (req.files && req.files['fondoGaleria'] && req.files['fondoGaleria'][0]) {
      const file = req.files['fondoGaleria'][0];
      if (file.path && file.path.includes('cloudinary.com')) {
        fondoGaleria = file.path;
      } else if (file.url) {
        fondoGaleria = file.url;
      }
    }

    // Procesar fondo para la vista de Contacto
    if (req.files && req.files['fondoContacto'] && req.files['fondoContacto'][0]) {
      const file = req.files['fondoContacto'][0];
      if (file.path && file.path.includes('cloudinary.com')) {
        fondoContacto = file.path;
      } else if (file.url) {
        fondoContacto = file.url;
      }
    }

    // Procesar la imagen de fondo única (fondoFile)
    if (req.files && req.files['fondoFile'] && req.files['fondoFile'][0]) {
      const fondoFile = req.files['fondoFile'][0];
      // Eliminar imagen de fondo anterior si existe
      if (homeInfo && homeInfo.fondoFileUrl && homeInfo.fondoFileUrl.includes('cloudinary.com')) {
        try {
          // Extraer public_id de la URL de Cloudinary
          const parts = homeInfo.fondoFileUrl.split('/');
          const fileName = parts[parts.length - 1];
          const publicId = 'webservitec/' + fileName.split('.')[0];
          await cloudinary.uploader.destroy(publicId);
          console.log('Imagen de fondo anterior eliminada:', publicId);
        } catch (err) {
          console.error('Error eliminando imagen de fondo en Cloudinary:', err);
        }
      }
      // Guardar la nueva ruta
      if (fondoFile.path && fondoFile.path.includes('cloudinary.com')) {
        fondoFilePath = fondoFile.path;
      } else if (fondoFile.url) {
        fondoFilePath = fondoFile.url;
      }
    }

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
    if (req.files && req.files['logoFile'] && req.files['logoFile'][0] && req.files['logoFile'][0].path) {
      // Eliminar logo anterior si se sube uno nuevo
      if (homeInfo && homeInfo.logoUrl && homeInfo.logoUrl.includes('cloudinary.com')) {
        const publicId = homeInfo.logoUrl.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy('webservitec/' + publicId);
      }
      logoPath = req.files['logoFile'][0].path; // URL de Cloudinary
    } else if (logoUrl && logoUrl.startsWith('http')) {
      logoPath = logoUrl;
    }
    // Procesar icono subido
    if (req.files && req.files['iconFile'] && req.files['iconFile'][0] && req.files['iconFile'][0].path) {
      // Eliminar icono anterior si se sube uno nuevo
      if (homeInfo && homeInfo.iconUrl && homeInfo.iconUrl.includes('cloudinary.com')) {
        const publicId = homeInfo.iconUrl.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy('webservitec/' + publicId);
      }
      iconPath = req.files['iconFile'][0].path; // URL de Cloudinary
    } else if (iconUrl && iconUrl.startsWith('http')) {
      iconPath = iconUrl;
    } else if (logoPath && !iconUrl) {
      // Si no se subió icono, usar el logo procesado pero en tamaño favicon
      const logoInputPath = path.join(__dirname, '../public', logoPath);
      const outputFile = 'favicon-' + Date.now() + '.png';
      const outputPath = path.join(__dirname, '../public/uploads', outputFile);
      await processCircularImage(logoInputPath, outputPath, 96);
      iconPath = '/uploads/' + outputFile;
    }

    // Validación para asegurar que solo una opción de fondo esté seleccionada
    const hasFondoFile = fondoFilePath !== null;
    const hasColorFondo = colorFondo && colorFondo.trim() !== '' && colorFondo !== '#ffffff';
    const hasFondoUrl = fondoUrl && fondoUrl.trim() !== '';
    const hasFondosEspecificos = fondoInicio || fondoServicios || fondoGaleria || fondoContacto;
    
    // Contador para verificar cuántas opciones de fondo están seleccionadas
    let selectedBackgroundOptions = 0;
    if (hasColorFondo) selectedBackgroundOptions++;
    if (hasFondoUrl) selectedBackgroundOptions++;
    if (hasFondoFile) selectedBackgroundOptions++;
    if (hasFondosEspecificos) selectedBackgroundOptions++;
    
    // Si hay más de una opción seleccionada, mostrar error
    if (selectedBackgroundOptions > 1) {
      return res.status(400).send('Solo puede seleccionar una opción de fondo: color, URL, imagen única o fondos específicos por vista.');
    }

    // Función auxiliar para eliminar imagen de Cloudinary
    async function eliminarImagenCloudinary(url) {
      if (url && url.includes('cloudinary.com')) {
        try {
          const parts = url.split('/');
          const fileName = parts[parts.length - 1];
          const publicId = 'webservitec/' + fileName.split('.')[0];
          await cloudinary.uploader.destroy(publicId);
          console.log('Imagen eliminada de Cloudinary:', publicId);
        } catch (err) {
          console.error('Error eliminando imagen de Cloudinary:', err);
        }
      }
    }

    // Limpiar recursos antiguos basados en la nueva selección
    if (homeInfo) {
      // Si está seleccionando una nueva opción, limpiar las otras opciones
      
      // Opción 1: Si está seleccionando color de fondo
      if (hasColorFondo) {
        // Limpiar fondos específicos si existen
        if (homeInfo.fondoInicio) {
          await eliminarImagenCloudinary(homeInfo.fondoInicio);
          homeInfo.fondoInicio = null;
        }
        if (homeInfo.fondoServicios) {
          await eliminarImagenCloudinary(homeInfo.fondoServicios);
          homeInfo.fondoServicios = null;
        }
        if (homeInfo.fondoGaleria) {
          await eliminarImagenCloudinary(homeInfo.fondoGaleria);
          homeInfo.fondoGaleria = null;
        }
        if (homeInfo.fondoContacto) {
          await eliminarImagenCloudinary(homeInfo.fondoContacto);
          homeInfo.fondoContacto = null;
        }
        
        // Limpiar fondoFileUrl si existe
        if (homeInfo.fondoFileUrl) {
          await eliminarImagenCloudinary(homeInfo.fondoFileUrl);
          homeInfo.fondoFileUrl = null;
        }
        
        // Limpiar fondoUrl
        homeInfo.fondoUrl = '';
      }
      
      // Opción 2: Si está seleccionando URL de fondo
      else if (hasFondoUrl) {
        // Limpiar fondos específicos si existen
        if (homeInfo.fondoInicio) {
          await eliminarImagenCloudinary(homeInfo.fondoInicio);
          homeInfo.fondoInicio = null;
        }
        if (homeInfo.fondoServicios) {
          await eliminarImagenCloudinary(homeInfo.fondoServicios);
          homeInfo.fondoServicios = null;
        }
        if (homeInfo.fondoGaleria) {
          await eliminarImagenCloudinary(homeInfo.fondoGaleria);
          homeInfo.fondoGaleria = null;
        }
        if (homeInfo.fondoContacto) {
          await eliminarImagenCloudinary(homeInfo.fondoContacto);
          homeInfo.fondoContacto = null;
        }
        
        // Limpiar fondoFileUrl si existe
        if (homeInfo.fondoFileUrl) {
          await eliminarImagenCloudinary(homeInfo.fondoFileUrl);
          homeInfo.fondoFileUrl = null;
        }
        
        // Limpiar colorFondo
        homeInfo.colorFondo = '';
      }
      
      // Opción 3: Si está seleccionando una sola imagen de fondo
      else if (hasFondoFile) {
        // Limpiar fondos específicos si existen
        if (homeInfo.fondoInicio) {
          await eliminarImagenCloudinary(homeInfo.fondoInicio);
          homeInfo.fondoInicio = null;
        }
        if (homeInfo.fondoServicios) {
          await eliminarImagenCloudinary(homeInfo.fondoServicios);
          homeInfo.fondoServicios = null;
        }
        if (homeInfo.fondoGaleria) {
          await eliminarImagenCloudinary(homeInfo.fondoGaleria);
          homeInfo.fondoGaleria = null;
        }
        if (homeInfo.fondoContacto) {
          await eliminarImagenCloudinary(homeInfo.fondoContacto);
          homeInfo.fondoContacto = null;
        }
        
        // Limpiar fondoUrl y colorFondo
        homeInfo.fondoUrl = '';
        homeInfo.colorFondo = '';
      }
      
      // Opción 4: Si está seleccionando fondos específicos por vista
      else if (hasFondosEspecificos) {
        // Limpiar fondoFileUrl si existe
        if (homeInfo.fondoFileUrl) {
          await eliminarImagenCloudinary(homeInfo.fondoFileUrl);
          homeInfo.fondoFileUrl = null;
        }
        
        // Limpiar fondoUrl y colorFondo
        homeInfo.fondoUrl = '';
        homeInfo.colorFondo = '';
        
        // Eliminar imágenes anteriores de fondos específicos si se están actualizando
        if (fondoInicio && homeInfo.fondoInicio && homeInfo.fondoInicio !== fondoInicio) {
          await eliminarImagenCloudinary(homeInfo.fondoInicio);
        }
        if (fondoServicios && homeInfo.fondoServicios && homeInfo.fondoServicios !== fondoServicios) {
          await eliminarImagenCloudinary(homeInfo.fondoServicios);
        }
        if (fondoGaleria && homeInfo.fondoGaleria && homeInfo.fondoGaleria !== fondoGaleria) {
          await eliminarImagenCloudinary(homeInfo.fondoGaleria);
        }
        if (fondoContacto && homeInfo.fondoContacto && homeInfo.fondoContacto !== fondoContacto) {
          await eliminarImagenCloudinary(homeInfo.fondoContacto);
        }
      }
    }

    if (!homeInfo) {
      homeInfo = new HomeInfo({ 
        nombreLocal, 
        slogan, 
        descripcion, 
        telefono, 
        direccion, 
        email, 
        logoUrl: logoPath, 
        iconUrl: iconPath, 
        TituloServicio1, 
        TituloServicio2,
        descripcionServicios,
        descripcionGaleria,
        descripcionContacto,
        colorFondo: hasColorFondo ? colorFondo : '',
        fondoUrl: hasFondoUrl ? fondoUrl : '',
        fondoFileUrl: hasFondoFile ? fondoFilePath : null,
        fondoInicio: fondoInicio || null,
        fondoServicios: fondoServicios || null,
        fondoGaleria: fondoGaleria || null,
        fondoContacto: fondoContacto || null
      });
    } else {
      // Actualizar datos básicos
      homeInfo.nombreLocal = nombreLocal;
      homeInfo.slogan = slogan;
      homeInfo.descripcion = descripcion;
      homeInfo.telefono = telefono;
      homeInfo.direccion = direccion;
      homeInfo.email = email;
      homeInfo.logoUrl = logoPath;
      homeInfo.iconUrl = iconPath;
      homeInfo.TituloServicio1 = TituloServicio1;
      homeInfo.TituloServicio2 = TituloServicio2;
      homeInfo.descripcionServicios = descripcionServicios;
      homeInfo.descripcionGaleria = descripcionGaleria;
      homeInfo.descripcionContacto = descripcionContacto;
      
      // Actualizar fondos según la opción seleccionada
      if (hasColorFondo) {
        homeInfo.colorFondo = colorFondo;
        homeInfo.fondoUrl = '';
        homeInfo.fondoFileUrl = null;
        homeInfo.fondoInicio = null;
        homeInfo.fondoServicios = null;
        homeInfo.fondoGaleria = null;
        homeInfo.fondoContacto = null;
      }
      else if (hasFondoUrl) {
        homeInfo.colorFondo = '';
        homeInfo.fondoUrl = fondoUrl;
        homeInfo.fondoFileUrl = null;
        homeInfo.fondoInicio = null;
        homeInfo.fondoServicios = null;
        homeInfo.fondoGaleria = null;
        homeInfo.fondoContacto = null;
      }
      else if (hasFondoFile) {
        homeInfo.colorFondo = '';
        homeInfo.fondoUrl = '';
        homeInfo.fondoFileUrl = fondoFilePath;
        homeInfo.fondoInicio = null;
        homeInfo.fondoServicios = null;
        homeInfo.fondoGaleria = null;
        homeInfo.fondoContacto = null;
      }
      else if (hasFondosEspecificos) {
        homeInfo.colorFondo = '';
        homeInfo.fondoUrl = '';
        homeInfo.fondoFileUrl = null;
        // Solo actualizar los fondos específicos que se subieron
        if (fondoInicio) homeInfo.fondoInicio = fondoInicio;
        if (fondoServicios) homeInfo.fondoServicios = fondoServicios;
        if (fondoGaleria) homeInfo.fondoGaleria = fondoGaleria;
        if (fondoContacto) homeInfo.fondoContacto = fondoContacto;
      }
    }
    await homeInfo.save();
    res.redirect('/admin/homeinfo');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar la información de inicio');
  }
};
