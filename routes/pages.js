const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceControllers');
const contactController = require('../controllers/contactControllers');
const galeriaController = require('../controllers/galeriControllers');
const homeInfoPublic = require('../controllers/homeInfoPublic');
const homeSliderController = require('../controllers/homeSliderController');
const cartController = require('../controllers/cartController');

// Middleware para obtener información del carrito en todas las páginas
router.use(cartController.getCartInfo);

// Página de clientes
router.get('/', homeInfoPublic.getHomeInfoPublic, homeSliderController.getHomeSlider, galeriaController.getGaleriaImages, (req, res) => res.render('pages/index'));
router.get('/services', homeInfoPublic.getHomeInfoPublic, serviceController.getServices);
router.get('/contact', homeInfoPublic.getHomeInfoPublic, contactController.getContact);
router.get('/galeria', homeInfoPublic.getHomeInfoPublic, galeriaController.getGaleria);

// Rutas del carrito
router.get('/cart', homeInfoPublic.getHomeInfoPublic, cartController.viewCart);
router.post('/cart/add', cartController.addToCart);
router.post('/cart/update', cartController.updateQuantity);
router.delete('/cart/remove/:itemId', cartController.removeItem);
router.post('/cart/clear', cartController.clearCart);
router.delete('/cart/remove-complete/:itemId', cartController.removeItemComplete);

// Ruta de prueba para verificar sesiones
router.get('/test-session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    cartCount: res.locals.cartCount,
    cartTotal: res.locals.cartTotal
  });
});

// Ruta para obtener enlaces de contacto
router.get('/get-contact-links', async (req, res) => {
  try {
    const Contact = require('../models/Contact');
    const contacts = await Contact.find({});
    
    if (contacts.length === 0) {
      return res.json({
        success: false,
        message: 'No hay contactos configurados'
      });
    }
    
    // Tomar el primer contacto (puedes modificar esto según tu lógica)
    const contact = contacts[0];
    
    // Convertir URL de Facebook a Messenger
    let messengerUrl = null;
    if (contact.facebookUrl) {
      // Extraer el ID del perfil de Facebook
      const facebookIdMatch = contact.facebookUrl.match(/id=(\d+)/);
      if (facebookIdMatch) {
        const facebookId = facebookIdMatch[1];
        messengerUrl = `https://www.messenger.com/t/${facebookId}`;
      }
    }
    
    res.json({
      success: true,
      whatsappUrl: contact.whatsappUrl || null,
      emailUrl: contact.emailUrl || null,
      messengerUrl: messengerUrl
    });
  } catch (error) {
    console.error('Error al obtener enlaces de contacto:', error);
    res.json({
      success: false,
      message: 'Error al obtener enlaces de contacto'
    });
  }
});

module.exports = router;


