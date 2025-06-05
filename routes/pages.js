const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceControllers');
const contactController = require('../controllers/contactControllers');
const galeriaController = require('../controllers/galeriControllers');
const homeInfoPublic = require('../controllers/homeInfoPublic');
const homeSliderController = require('../controllers/homeSliderController');

// Página de clientes
router.get('/', homeInfoPublic.getHomeInfoPublic, homeSliderController.getHomeSlider, galeriaController.getGaleriaImages, (req, res) => res.render('pages/index'));
router.get('/services', homeInfoPublic.getHomeInfoPublic, serviceController.getServices);
router.get('/contact', homeInfoPublic.getHomeInfoPublic, contactController.getContact);
router.get('/galeria', homeInfoPublic.getHomeInfoPublic, galeriaController.getGaleria);

module.exports = router;


