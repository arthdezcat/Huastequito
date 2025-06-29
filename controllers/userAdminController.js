const Admin = require('../models/Admin');

// Mostrar todos los usuarios administradores
exports.getUsers = async (req, res) => {
  const users = await Admin.find();
  res.render('admin/users', { users });
};

// Crear nuevo usuario administrador
exports.createUser = async (req, res) => {
  const { username, password, role, permissions } = req.body;
  try {
    const user = new Admin({ username, password, role, permissions });
    await user.save();
    res.redirect('/admin/users');
  } catch (error) {
    res.status(500).send('Error al crear usuario: ' + error.message);
  }
};

// Eliminar usuario administrador
exports.deleteUser = async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.redirect('/admin/users');
  } catch (error) {
    res.status(500).send('Error al eliminar usuario: ' + error.message);
  }
};
