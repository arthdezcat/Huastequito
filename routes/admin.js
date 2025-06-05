const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceControllers');
const contactController = require('../controllers/contactControllers');
const galeriaController = require('../controllers/galeriControllers');
const homeInfoController = require('../controllers/homeInfoController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadImage');

// Proteger rutas del panel de administración
router.use(authMiddleware.isAuthenticated);
// Panel de administración para servicios
router.get('/services', async (req, res) => {
  const services = await require('../models/Service').find();
  res.render('admin/services', { services });
});

router.get('/contact', async (req, res) => {
  const contact = await require('../models/Contact').find();
  res.render('admin/contact', { contact });
});

router.get('/galeria', async (req, res) => {
  const galeria = await require('../models/Galeria').find();
  res.render('admin/galeri', { galeria });
});

router.get('/', (req, res) => res.render('admin/index'));
router.post('/services/add', upload.single('imageFile'), serviceController.addService);
router.post('/services/delete/:id', serviceController.deleteService);
router.post('/contact/add', upload.single('iconFile'), contactController.addContact);
router.post('/contact/delete/:id', contactController.deleteContact);
router.post('/galeria/add', upload.single('imageFile'), galeriaController.addGaleria);
router.post('/galeria/delete/:id', galeriaController.deleteGaleria);

// Rutas para actualizar registros
router.post('/services/update/:id', upload.single('imageFile'), serviceController.updateService);
router.post('/galeria/update/:id', upload.single('imageFile'), galeriaController.updateGaleria);
router.post('/contact/update/:id', upload.single('iconFile'), contactController.updateContact);
// Ruta para mostrar y editar información de inicio
router.get('/homeinfo', homeInfoController.getHomeInfo);
router.post('/homeinfo', upload.fields([
  { name: 'logoFile', maxCount: 1 },
  { name: 'iconFile', maxCount: 1 }
]), homeInfoController.updateHomeInfo);

module.exports = router;
