const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');

// Inicio de sesión
router.get('/login', authController.showLoginPage);
router.post('/login', authController.loginAdmin);

// Cierre de sesión
router.get('/logout', authController.logoutAdmin);

module.exports = router;
