/**
 * backgroundSlider.js
 * Script para manejar el slider de fondos en todas las vistas
 */

// Configuración global del slider
const BackgroundSlider = {
  // Propiedades configurables
  transitionTime: 3500, // Tiempo de transición en milisegundos (3.5 segundos para una transición mucho más notoria)
  slideDuration: 7000,  // Tiempo que cada imagen permanece visible (7 segundos entre cada cambio para apreciar mejor)
  pauseOnHover: true,   // Pausar el slider al pasar el ratón sobre los indicadores
  showControls: true,   // Mostrar controles de navegación
  showIndicators: true, // Mostrar indicadores de posición
  
  // Variables internas
  fondoImgs: [],
  fondoIdx: 0,
  interval: null,
  isPaused: false,
  
  /**
   * Inicializa el slider de fondo
   * @param {Array} images - Array de URLs de imágenes
   */
  init: function(images) {
    if (!images || images.length < 4) return false;
    
    this.fondoImgs = images;
    this.fondoIdx = 0;
    
    // Crear elementos del DOM
    this.createDOMElements();
    
    // Iniciar el slider
    this.startSlider();
    
    // Remover el estilo de fondo del body para evitar conflictos y aplicar un efecto de transición más notorio
    document.body.style.background = 'transparent';
    document.body.style.transition = 'none'; // Deshabilitar la transición en el body para evitar conflictos
    
    // Agregar clase para indicar que el body tiene un slider de fondo
    document.body.classList.add('has-bg-slider');
    document.body.classList.add('background-slider-active'); // Clase adicional para estilos específicos
    
    // Agregar un mensaje visual para confirmar la carga del slider
    const confirmMsg = document.createElement('div');
    confirmMsg.style.position = 'fixed';
    confirmMsg.style.bottom = '60px';
    confirmMsg.style.left = '50%';
    confirmMsg.style.transform = 'translateX(-50%)';
    confirmMsg.style.padding = '10px 15px';
    confirmMsg.style.background = 'rgba(0,0,0,0.6)';
    confirmMsg.style.color = '#fff';
    confirmMsg.style.borderRadius = '4px';
    confirmMsg.style.fontSize = '14px';
    confirmMsg.style.zIndex = '1000';
    confirmMsg.style.opacity = '0';
    confirmMsg.style.transition = 'opacity 0.5s ease-in-out';
    confirmMsg.textContent = 'Slider de imágenes de fondo activado';
    document.body.appendChild(confirmMsg);
    
    // Mostrar y ocultar el mensaje
    setTimeout(() => {
      confirmMsg.style.opacity = '1';
      setTimeout(() => {
        confirmMsg.style.opacity = '0';
        setTimeout(() => {
          confirmMsg.remove();
        }, 500);
      }, 2000);
    }, 500);
    
    return true;
  },
  
  /**
   * Crea los elementos del DOM necesarios para el slider
   */
  createDOMElements: function() {
    // Crear contenedor principal con posición mejorada para mayor visibilidad
    const bgSlider = document.createElement('div');
    bgSlider.id = 'bg-slider';
    bgSlider.style.position = 'fixed';
    bgSlider.style.top = '0';
    bgSlider.style.left = '0';
    bgSlider.style.width = '100%';
    bgSlider.style.height = '100%';
    bgSlider.style.zIndex = '-2'; // Mantener por debajo del contenido pero encima de otros elementos de fondo
    bgSlider.style.overflow = 'hidden'; // Asegura que no haya desbordamientos
    
    // Crear los dos divs para el crossfade
    const bg1 = document.createElement('div');
    bg1.id = 'bg-1';
    bg1.style.position = 'absolute';
    bg1.style.top = '0';
    bg1.style.left = '0';
    bg1.style.width = '100%';
    bg1.style.height = '100%';
    bg1.style.backgroundSize = 'cover';
    bg1.style.backgroundPosition = 'center';
    bg1.style.backgroundImage = 'url(' + this.fondoImgs[0] + ')';
    bg1.style.opacity = '1';
    bg1.style.transition = 'opacity ' + (this.transitionTime/1000) + 's cubic-bezier(0.4, 0, 0.2, 1)'; // Curva de aceleración para transición más dramática
    bg1.style.transform = 'scale(1.01)'; // Ligero zoom para efecto más visible
    bg1.style.filter = 'brightness(1.05)'; // Brillo ligeramente aumentado para mejor contraste
    
    const bg2 = document.createElement('div');
    bg2.id = 'bg-2';
    bg2.style.position = 'absolute';
    bg2.style.top = '0';
    bg2.style.left = '0';
    bg2.style.width = '100%';
    bg2.style.height = '100%';
    bg2.style.backgroundSize = 'cover';
    bg2.style.backgroundPosition = 'center';
    bg2.style.backgroundImage = 'url(' + this.fondoImgs[1 % this.fondoImgs.length] + ')'; // Cargar la segunda imagen para tenerla precargada
    bg2.style.opacity = '0';
    bg2.style.transition = 'opacity ' + (this.transitionTime/1000) + 's cubic-bezier(0.4, 0, 0.2, 1)'; // Misma curva que bg1
    bg2.style.transform = 'scale(1.01)'; // Ligero zoom para efecto más visible
    bg2.style.filter = 'brightness(1.05)'; // Brillo ligeramente aumentado para mejor contraste
    
    // Crear los indicadores de posición, con estilo mejorado para mayor visibilidad
    const indicators = document.createElement('div');
    indicators.id = 'bg-indicators';
    indicators.style.position = 'fixed';
    indicators.style.bottom = '25px'; // Posición más alta para mayor visibilidad
    indicators.style.left = '50%';
    indicators.style.transform = 'translateX(-50%)';
    indicators.style.zIndex = '1000';
    indicators.style.display = 'flex';
    indicators.style.gap = '12px'; // Más espacio entre indicadores
    indicators.style.padding = '8px 15px'; // Padding aumentado
    indicators.style.borderRadius = '25px';
    indicators.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Fondo más oscuro para mejor visibilidad
    indicators.style.backdropFilter = 'blur(8px)'; // Mayor efecto de desenfoque
    indicators.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.2)'; // Sombra doble con borde sutil
    indicators.style.transition = 'all 0.5s ease'; // Transición suave para estados hover
    
    // Crear botones de navegación con estilo mejorado
    const prevButton = document.createElement('button');
    prevButton.id = 'bg-prev';
    prevButton.innerHTML = '&#10094;';
    prevButton.style.position = 'fixed';
    prevButton.style.left = '25px';
    prevButton.style.top = '50%';
    prevButton.style.transform = 'translateY(-50%)';
    prevButton.style.zIndex = '999';
    prevButton.style.background = 'rgba(0, 0, 0, 0.6)'; // Mayor opacidad para mejor visibilidad
    prevButton.style.color = '#fff';
    prevButton.style.border = '2px solid rgba(255, 255, 255, 0.5)'; // Borde visible para destacar
    prevButton.style.borderRadius = '50%';
    prevButton.style.width = '48px'; // Botones más grandes
    prevButton.style.height = '48px';
    prevButton.style.fontSize = '22px'; // Texto más grande
    prevButton.style.cursor = 'pointer';
    prevButton.style.display = 'flex';
    prevButton.style.alignItems = 'center';
    prevButton.style.justifyContent = 'center';
    prevButton.style.backdropFilter = 'blur(5px)';
    prevButton.style.boxShadow = '0 3px 10px rgba(0,0,0,0.4)'; // Sombra más pronunciada
    prevButton.style.transition = 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'; // Transición más suave
    
    const nextButton = document.createElement('button');
    nextButton.id = 'bg-next';
    nextButton.innerHTML = '&#10095;';
    nextButton.style.position = 'fixed';
    nextButton.style.right = '25px';
    nextButton.style.top = '50%';
    nextButton.style.transform = 'translateY(-50%)';
    nextButton.style.zIndex = '999';
    nextButton.style.background = 'rgba(0, 0, 0, 0.6)'; // Mayor opacidad para mejor visibilidad
    nextButton.style.color = '#fff';
    nextButton.style.border = '2px solid rgba(255, 255, 255, 0.5)'; // Borde visible para destacar
    nextButton.style.borderRadius = '50%';
    nextButton.style.width = '48px'; // Botones más grandes
    nextButton.style.height = '48px';
    nextButton.style.fontSize = '22px'; // Texto más grande
    nextButton.style.cursor = 'pointer';
    nextButton.style.display = 'flex';
    nextButton.style.alignItems = 'center';
    nextButton.style.justifyContent = 'center';
    nextButton.style.backdropFilter = 'blur(5px)';
    nextButton.style.boxShadow = '0 3px 10px rgba(0,0,0,0.4)'; // Sombra más pronunciada
    nextButton.style.transition = 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'; // Transición más suave
    
    // Hover effects mejorados para botones
    prevButton.onmouseover = function() { 
        this.style.background = 'rgba(0, 0, 0, 0.8)'; 
        this.style.transform = 'translateY(-50%) scale(1.1)';
        this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.6)';
        this.style.borderColor = '#fff';
    };
    prevButton.onmouseout = function() { 
        this.style.background = 'rgba(0, 0, 0, 0.6)'; 
        this.style.transform = 'translateY(-50%) scale(1)';
        this.style.boxShadow = '0 3px 10px rgba(0,0,0,0.4)';
        this.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    };
    nextButton.onmouseover = function() { 
        this.style.background = 'rgba(0, 0, 0, 0.8)'; 
        this.style.transform = 'translateY(-50%) scale(1.1)';
        this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.6)';
        this.style.borderColor = '#fff';
    };
    nextButton.onmouseout = function() { 
        this.style.background = 'rgba(0, 0, 0, 0.6)'; 
        this.style.transform = 'translateY(-50%) scale(1)';
        this.style.boxShadow = '0 3px 10px rgba(0,0,0,0.4)';
        this.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    };
    
    // Eventos para los botones
    prevButton.addEventListener('click', () => this.prevSlide());
    nextButton.addEventListener('click', () => this.nextSlide());
    
    // Crear indicadores más notorios para cada imagen
    for (let i = 0; i < this.fondoImgs.length; i++) {
      const dot = document.createElement('span');
      dot.classList.add('bg-indicator');
      dot.dataset.index = i;
      dot.style.width = '16px'; // Más grandes
      dot.style.height = '16px';
      dot.style.background = i === 0 ? '#fff' : 'rgba(255,255,255,0.5)';
      dot.style.border = '2px solid ' + (i === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'); // Borde para destacar
      dot.style.borderRadius = '50%';
      dot.style.cursor = 'pointer';
      dot.style.transition = 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)'; // Transición más suave
      dot.style.boxShadow = '0 0 8px rgba(0,0,0,0.5)'; // Sombra más pronunciada
      dot.style.margin = '0 3px'; // Espacio adicional
      
      // Permitir hacer clic en los indicadores
      dot.addEventListener('click', (e) => {
        const clickedIndex = parseInt(e.target.dataset.index);
        if (this.fondoIdx !== clickedIndex) {
          this.fondoIdx = clickedIndex;
          this.updateBackground();
          this.updateIndicators();
        }
      });
      
      // Pausar/reanudar al pasar el ratón
      if (this.pauseOnHover) {
        dot.addEventListener('mouseenter', () => this.pause());
        dot.addEventListener('mouseleave', () => this.resume());
      }
      
      indicators.appendChild(dot);
    }
    
    // Añadir los elementos al DOM
    bgSlider.appendChild(bg1);
    bgSlider.appendChild(bg2);
    document.body.appendChild(bgSlider);
    document.body.appendChild(indicators);
    document.body.appendChild(prevButton);
    document.body.appendChild(nextButton);
    
    // Asegurar que los controles no interfieran con elementos importantes
    this.setupResponsive();
  },
  
  /**
   * Inicia el slider automático
   */
  startSlider: function() {
    if (this.interval) clearInterval(this.interval);
    
    this.interval = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, this.slideDuration);
  },
  
  /**
   * Actualiza el fondo actual con una transición mejorada
   */
  updateBackground: function() {
    const bg1 = document.getElementById('bg-1');
    const bg2 = document.getElementById('bg-2');
    
    // Determinar cuál div está visible y cuál oculto
    const visibleBg = bg1.style.opacity === '1' ? bg1 : bg2;
    const hiddenBg = bg1.style.opacity === '0' ? bg1 : bg2;
    
    // Precargar la imagen antes del cambio
    const img = new Image();
    img.src = this.fondoImgs[this.fondoIdx];
    
    // Notificar el inicio de la transición con un elemento visual
    const transitionIndicator = document.createElement('div');
    transitionIndicator.style.position = 'fixed';
    transitionIndicator.style.top = '20px';
    transitionIndicator.style.right = '20px';
    transitionIndicator.style.padding = '5px 10px';
    transitionIndicator.style.background = 'rgba(0,0,0,0.6)';
    transitionIndicator.style.color = '#fff';
    transitionIndicator.style.borderRadius = '4px';
    transitionIndicator.style.fontSize = '12px';
    transitionIndicator.style.opacity = '0';
    transitionIndicator.style.transition = 'opacity 0.5s ease';
    transitionIndicator.style.zIndex = '1001';
    transitionIndicator.textContent = 'Cambiando imagen ' + (this.fondoIdx + 1) + ' / ' + this.fondoImgs.length;
    document.body.appendChild(transitionIndicator);
    
    // Mostrar brevemente el indicador de transición
    setTimeout(() => {
      transitionIndicator.style.opacity = '0.8';
      setTimeout(() => {
        transitionIndicator.style.opacity = '0';
        setTimeout(() => transitionIndicator.remove(), 500);
      }, 1500);
    }, 0);
    
    // Asegurar una transición suave con efectos visuales adicionales
    img.onload = () => {
      // Configurar el fondo oculto con la siguiente imagen
      hiddenBg.style.backgroundImage = 'url(' + this.fondoImgs[this.fondoIdx] + ')';
      
      // Añadir efectos visuales para la transición
      hiddenBg.style.transform = 'scale(1.03)'; // Ligero zoom inicial
      
      // Hacer visible con efecto de zoom suave
      setTimeout(() => {
        visibleBg.style.opacity = '0';
        hiddenBg.style.opacity = '1';
        
        // Reducir el zoom después de la transición para un efecto más natural
        setTimeout(() => {
          hiddenBg.style.transform = 'scale(1.01)';
        }, this.transitionTime * 0.8);
      }, 50);
      
      // Notificar el cambio de imagen para debugging
      console.log('Cambiando imagen de fondo a:', this.fondoIdx + 1, 'de', this.fondoImgs.length);
    };
  },
  
  /**
   * Actualiza los indicadores de posición con efectos visuales mejorados
   */
  updateIndicators: function() {
    const dots = document.querySelectorAll('.bg-indicator');
    dots.forEach((dot, i) => {
      if (i === this.fondoIdx) {
        dot.style.background = '#fff';
        dot.style.transform = 'scale(1.3)'; // Escala aumentada
        dot.style.border = '2px solid rgba(255,255,255,0.9)'; // Borde más visible
        dot.style.boxShadow = '0 0 12px rgba(255,255,255,0.8), 0 0 5px rgba(255,255,255,0.5)'; // Efecto de brillo
        dot.style.width = '18px'; // Ligeramente más grande cuando está activo
        dot.style.height = '18px';
      } else {
        dot.style.background = 'rgba(255,255,255,0.4)'; // Menos opaco para mayor contraste
        dot.style.transform = 'scale(1)';
        dot.style.border = '2px solid rgba(255,255,255,0.3)';
        dot.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
        dot.style.width = '14px';
        dot.style.height = '14px';
      }
    });
  },
  
  /**
   * Avanza a la siguiente diapositiva
   */
  nextSlide: function() {
    this.fondoIdx = (this.fondoIdx + 1) % this.fondoImgs.length;
    this.updateBackground();
    this.updateIndicators();
  },
  
  /**
   * Retrocede a la diapositiva anterior
   */
  prevSlide: function() {
    this.fondoIdx = (this.fondoIdx - 1 + this.fondoImgs.length) % this.fondoImgs.length;
    this.updateBackground();
    this.updateIndicators();
  },
  
  /**
   * Pausa el slider
   */
  pause: function() {
    this.isPaused = true;
  },
  
  /**
   * Reanuda el slider
   */
  resume: function() {
    this.isPaused = false;
  },
  
  /**
   * Configura ajustes responsive
   */
  setupResponsive: function() {
    // Ajustar para móviles
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    const adjustForMobile = (e) => {
      const indicators = document.getElementById('bg-indicators');
      const prevButton = document.getElementById('bg-prev');
      const nextButton = document.getElementById('bg-next');
      
      if (e.matches) { // Móvil
        indicators.style.bottom = '10px';
        indicators.style.padding = '3px 8px';
        
        if (prevButton && nextButton) {
          prevButton.style.width = '30px';
          prevButton.style.height = '30px';
          prevButton.style.fontSize = '14px';
          prevButton.style.left = '10px';
          
          nextButton.style.width = '30px';
          nextButton.style.height = '30px';
          nextButton.style.fontSize = '14px';
          nextButton.style.right = '10px';
        }
      } else { // Desktop
        indicators.style.bottom = '20px';
        indicators.style.padding = '5px 10px';
        
        if (prevButton && nextButton) {
          prevButton.style.width = '40px';
          prevButton.style.height = '40px';
          prevButton.style.fontSize = '18px';
          prevButton.style.left = '20px';
          
          nextButton.style.width = '40px';
          nextButton.style.height = '40px';
          nextButton.style.fontSize = '18px';
          nextButton.style.right = '20px';
        }
      }
    };
    
    // Ejecutar inicialmente
    adjustForMobile(mediaQuery);
    
    // Añadir listener para cambios
    mediaQuery.addListener(adjustForMobile);
  }
};

// Exponer globalmente
window.BackgroundSlider = BackgroundSlider;
