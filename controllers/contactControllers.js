const Contact = require('../models/Contact');
const sharp = require('sharp');
const path = require('path');


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
    let iconFile = req.file ? req.file.filename : undefined;
    // Procesar imagen a circular si se subió
    if (iconFile) {
      const inputPath = path.join(__dirname, '../public/uploads', iconFile);
      const outputPath = path.join(__dirname, '../public/uploads', 'circle-' + iconFile);
      await sharp(inputPath)
        .resize(160, 160)
        .composite([
          {
            input: Buffer.from(
              `<svg><circle cx="80" cy="80" r="80"/></svg>`
            ),
            blend: 'dest-in'
          }
        ])
        .png()
        .toFile(outputPath);
      iconFile = 'circle-' + iconFile;
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
      iconUrl,
      iconFile
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
    let iconFile = req.file ? req.file.filename : undefined;
    // Procesar imagen a circular si se subió
    if (iconFile) {
      const inputPath = path.join(__dirname, '../public/uploads', iconFile);
      const outputPath = path.join(__dirname, '../public/uploads', 'circle-' + iconFile);
      await sharp(inputPath)
        .resize(160, 160)
        .composite([
          {
            input: Buffer.from(
              `<svg><circle cx="80" cy="80" r="80"/></svg>`
            ),
            blend: 'dest-in'
          }
        ])
        .png()
        .toFile(outputPath);
      iconFile = 'circle-' + iconFile;
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
    if (iconFile) updateData.iconFile = iconFile;
    await Contact.findByIdAndUpdate(id, updateData);
    res.redirect('/admin/contact');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar el contacto');
  }
};

// Eliminar un servicio
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.redirect('/admin/contact');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar el servicio');
  }
};