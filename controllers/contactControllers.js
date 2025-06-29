const Contact = require('../models/Contact');
const sharp = require('sharp');
const path = require('path');
const { cloudinary } = require('../middlewares/cloudinary');


// Obtener todos los servicios
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.find();
    res.render('pages/contact', { contact, homeInfo: res.locals.homeInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los servicios');
  }
};

// Añadir un nuevo servicio
exports.addContact = async (req, res) => {
  try {
    let { name, email, telefono, facebookUrl, extraUrl, footer, iconColor, iconUrl } = req.body;
    // Si se subió archivo, usar la URL de Cloudinary
    if (req.file && req.file.path) {
      iconUrl = req.file.path;
    }
    // Generar emailUrl y whatsappUrl automáticamente
    const emailUrl = email ? `mailto:${email}` : '';
    const telefonoNum = telefono ? telefono.replace(/\D/g, '') : '';
    const whatsappUrl = telefonoNum ? `https://wa.me/${telefonoNum}` : '';
    const newContact = new Contact({
      name,
      email,
      telefono,
      emailUrl,
      whatsappUrl,
      facebookUrl,
      extraUrl,
      footer,
      iconColor,
      iconUrl
    });
    await newContact.save();
    res.redirect('/admin/contact');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al agregar el contacto');
  }
};

// Actualizar un contacto
exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, email, telefono, facebookUrl, extraUrl, footer, iconColor, iconUrl } = req.body;
    const contacto = await Contact.findById(id);
    if (req.file && req.file.path) {
      if (contacto && contacto.iconUrl && contacto.iconUrl.includes('cloudinary.com')) {
        const publicId = contacto.iconUrl.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy('webservitec/' + publicId);
      }
      iconUrl = req.file.path;
    }
    // Generar emailUrl y whatsappUrl automáticamente
    const emailUrl = email ? `mailto:${email}` : '';
    const telefonoNum = telefono ? telefono.replace(/\D/g, '') : '';
    const whatsappUrl = telefonoNum ? `https://wa.me/${telefonoNum}` : '';
    const updateData = {
      name,
      email,
      telefono,
      emailUrl,
      whatsappUrl,
      facebookUrl,
      extraUrl,
      footer,
      iconColor,
      iconUrl
    };
    await Contact.findByIdAndUpdate(id, updateData);
    res.redirect('/admin/contact');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar el contacto');
  }
};

// Eliminar un contacto
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contacto = await Contact.findById(id);
    if (contacto && contacto.iconUrl && contacto.iconUrl.includes('cloudinary.com')) {
      const publicId = contacto.iconUrl.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy('webservitec/' + publicId);
    }
    await Contact.findByIdAndDelete(id);
    res.redirect('/admin/contact');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar el contacto');
  }
};