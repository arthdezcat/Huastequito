const Cart = require('../models/Cart');
const Service = require('../models/Service');
const Galeria = require('../models/Galeria');

// Obtener o crear carrito para una sesión
const getOrCreateCart = async (sessionId) => {
  let cart = await Cart.findOne({ sessionId });
  if (!cart) {
    cart = new Cart({ sessionId, items: [] });
    await cart.save();
  }
  return cart;
};

// Agregar producto al carrito
exports.addToCart = async (req, res) => {
  try {
    const { productId, productType, colorSeleccionado, tallaSeleccionada, cantidad = 1 } = req.body;
    const sessionId = req.sessionID;

    console.log('Session ID:', sessionId);
    console.log('Request body:', req.body);

    if (!sessionId) {
      console.log('No session ID found');
      return res.status(400).json({ success: false, message: 'Sesión no válida' });
    }

    // Obtener información del producto
    let product;
    if (productType === 'service') {
      product = await Service.findById(productId);
    } else if (productType === 'galeria') {
      product = await Galeria.findById(productId);
    }

    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    console.log('Product found:', product.title);

    // Obtener o crear carrito
    const cart = await getOrCreateCart(sessionId);
    console.log('Cart found/created:', cart._id);

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && 
      item.productType === productType &&
      item.colorSeleccionado === colorSeleccionado &&
      item.tallaSeleccionada === tallaSeleccionada
    );

    if (existingItemIndex > -1) {
      // Actualizar cantidad si ya existe
      cart.items[existingItemIndex].cantidad += parseInt(cantidad);
      console.log('Updated existing item quantity');
    } else {
      // Agregar nuevo item
      const cartItem = {
        productId: product._id,
        productType,
        title: product.title,
        description: product.description,
        price: product.price,
        image: product.image,
        cantidad: parseInt(cantidad),
        colorSeleccionado,
        tallaSeleccionada,
        garantia: product.garantia
      };

      // Agregar campos específicos para ofertas
      if (productType === 'galeria') {
        cartItem.tipoOferta = product.tipoOferta;
        cartItem.ofertaEspecial = product.ofertaEspecial;
        cartItem.porcentajeDescuento = product.porcentajeDescuento;
        cartItem.fechaInicio = product.fechaInicio;
        cartItem.fechaFin = product.fechaFin;
      }

      cart.items.push(cartItem);
      console.log('Added new item to cart');
    }

    await cart.save();
    console.log('Cart saved successfully');

    // Forzar guardado de sesión
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
      }
    });

    res.json({ 
      success: true, 
      message: 'Producto agregado al carrito',
      cartCount: cart.getTotalItems(),
      cartTotal: cart.getTotal()
    });

  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Ver carrito
exports.viewCart = async (req, res) => {
  try {
    const sessionId = req.sessionID;
    
    console.log('ViewCart - Session ID:', sessionId);
    
    if (!sessionId) {
      console.log('No session ID found in viewCart');
      return res.render('pages/cart', { 
        cart: { items: [] }, 
        total: 0, 
        totalItems: 0,
        homeInfo: res.locals.homeInfo 
      });
    }

    const cart = await Cart.findOne({ sessionId });
    console.log('Cart found:', cart ? cart._id : 'No cart found');
    
    if (!cart || cart.items.length === 0) {
      console.log('Cart is empty or not found');
      return res.render('pages/cart', { 
        cart: { items: [] }, 
        total: 0, 
        totalItems: 0,
        homeInfo: res.locals.homeInfo 
      });
    }

    console.log('Cart items count:', cart.items.length);
    const total = cart.getTotal();
    const totalItems = cart.getTotalItems();
    console.log('Total:', total, 'TotalItems:', totalItems);

    res.render('pages/cart', { 
      cart, 
      total, 
      totalItems,
      homeInfo: res.locals.homeInfo 
    });

  } catch (error) {
    console.error('Error al ver carrito:', error);
    res.status(500).render('pages/cart', { 
      cart: { items: [] }, 
      total: 0, 
      totalItems: 0,
      homeInfo: res.locals.homeInfo,
      error: 'Error al cargar el carrito' 
    });
  }
};

// Actualizar cantidad de un item
exports.updateQuantity = async (req, res) => {
  try {
    const { itemId, cantidad } = req.body;
    const sessionId = req.sessionID;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Sesión no válida' });
    }

    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item no encontrado' });
    }

    if (cantidad <= 0) {
      // Eliminar item si cantidad es 0 o menor
      cart.items.pull(itemId);
    } else {
      item.cantidad = parseInt(cantidad);
    }

    await cart.save();

    res.json({ 
      success: true, 
      message: 'Cantidad actualizada',
      cartCount: cart.getTotalItems(),
      cartTotal: cart.getTotal()
    });

  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Eliminar item del carrito
exports.removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const sessionId = req.sessionID;

    console.log('Removing item:', itemId, 'from session:', sessionId);

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Sesión no válida' });
    }

    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
    }

    // Encontrar el item antes de eliminarlo para obtener información
    const itemToRemove = cart.items.id(itemId);
    if (!itemToRemove) {
      return res.status(404).json({ success: false, message: 'Item no encontrado' });
    }

    console.log('Item to remove:', {
      productId: itemToRemove.productId,
      productType: itemToRemove.productType,
      title: itemToRemove.title
    });

    // Eliminar el item del carrito
    cart.items.pull(itemId);
    await cart.save();

    // Si el carrito está vacío, eliminar el carrito completo de la base de datos
    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
      console.log('Cart deleted from database (empty)');
    }

    // Opcional: Eliminar el producto original de la base de datos si es necesario
    // Descomenta las siguientes líneas si quieres eliminar también el producto original
    /*
    try {
      if (itemToRemove.productType === 'service') {
        await Service.findByIdAndDelete(itemToRemove.productId);
        console.log('Service deleted from database');
      } else if (itemToRemove.productType === 'galeria') {
        await Galeria.findByIdAndDelete(itemToRemove.productId);
        console.log('Galeria item deleted from database');
      }
    } catch (deleteError) {
      console.error('Error deleting original product:', deleteError);
      // No fallamos la operación si no se puede eliminar el producto original
    }
    */

    res.json({ 
      success: true, 
      message: 'Item eliminado del carrito',
      cartCount: cart.items.length > 0 ? cart.getTotalItems() : 0,
      cartTotal: cart.items.length > 0 ? cart.getTotal() : 0
    });

  } catch (error) {
    console.error('Error al eliminar item:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Limpiar carrito (sin eliminar productos originales)
exports.clearCart = async (req, res) => {
  try {
    const sessionId = req.sessionID;

    console.log('Clearing cart for session:', sessionId);

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Sesión no válida' });
    }

    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
    }

    console.log('Cart found, deleting only cart from database');

    // Eliminar completamente el carrito de la base de datos (NO tocar productos originales)
    await Cart.findByIdAndDelete(cart._id);

    console.log('Cart deleted from database (products remain)');

    res.json({ 
      success: true, 
      message: 'Carrito limpiado completamente',
      cartCount: 0,
      cartTotal: 0
    });

  } catch (error) {
    console.error('Error al limpiar carrito:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Eliminar item del carrito (sin tocar productos originales)
exports.removeItemComplete = async (req, res) => {
  try {
    const { itemId } = req.params;
    const sessionId = req.sessionID;

    console.log('Removing item from cart:', itemId, 'from session:', sessionId);

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Sesión no válida' });
    }

    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
    }

    // Encontrar el item antes de eliminarlo para obtener información
    const itemToRemove = cart.items.id(itemId);
    if (!itemToRemove) {
      return res.status(404).json({ success: false, message: 'Item no encontrado' });
    }

    console.log('Item to remove from cart:', {
      productId: itemToRemove.productId,
      productType: itemToRemove.productType,
      title: itemToRemove.title
    });

    // Eliminar solo el item del carrito (NO tocar productos originales)
    cart.items.pull(itemId);
    await cart.save();

    // Si el carrito está vacío, eliminar el carrito completo de la base de datos
    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
      console.log('Cart deleted from database (empty)');
    }

    res.json({ 
      success: true, 
      message: 'Item eliminado del carrito',
      cartCount: cart.items.length > 0 ? cart.getTotalItems() : 0,
      cartTotal: cart.items.length > 0 ? cart.getTotal() : 0
    });

  } catch (error) {
    console.error('Error al eliminar item del carrito:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};



// Obtener información del carrito (para mostrar contador en header)
exports.getCartInfo = async (req, res, next) => {
  try {
    const sessionId = req.sessionID;
    
    if (sessionId) {
      const cart = await Cart.findOne({ sessionId });
      if (cart) {
        res.locals.cartCount = cart.getTotalItems();
        res.locals.cartTotal = cart.getTotal();
        console.log('CartInfo - Session:', sessionId, 'Count:', res.locals.cartCount, 'Total:', res.locals.cartTotal);
      } else {
        res.locals.cartCount = 0;
        res.locals.cartTotal = 0;
        console.log('CartInfo - No cart found for session:', sessionId);
      }
    } else {
      res.locals.cartCount = 0;
      res.locals.cartTotal = 0;
      console.log('CartInfo - No session ID');
    }
    
    next();
  } catch (error) {
    console.error('Error al obtener información del carrito:', error);
    res.locals.cartCount = 0;
    res.locals.cartTotal = 0;
    next();
  }
}; 