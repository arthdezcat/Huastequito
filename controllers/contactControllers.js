const Contact = require('../models/Contact');
const { cloudinary } = require('../middlewares/uploadImage');


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
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'contacts' });
      iconFile = result.secure_url;
    }
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
    const contact = await Contact.findById(id);
    let { name, email, telefono, facebookUrl, extraUrl, footer, iconColor, iconUrl } = req.body;
    let iconFile = req.file ? req.file.filename : undefined;
    if (req.file) {
      if (contact.iconFile) {
        const publicId = contact.iconFile.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'contacts' });
      iconFile = result.secure_url;
    }
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
      iconUrl,
      iconFile
    };
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
    const contact = await Contact.findById(id);
    if (contact.iconFile) {
      const publicId = contact.iconFile.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await Contact.findByIdAndDelete(id);
    res.redirect('/admin/contact');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar el servicio');
  }
};