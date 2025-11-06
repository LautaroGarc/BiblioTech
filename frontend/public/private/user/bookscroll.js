// Funcionalidad tipo TikTok
document.addEventListener('DOMContentLoaded', function() {
  const mainContent = document.querySelector('.main-content');
  const libros = document.querySelectorAll('.libro');
  const scrollDots = document.querySelectorAll('.scroll-dot');
  const likeButtons = document.querySelectorAll('.like-btn');
  
  // Actualizar indicadores de scroll
  function updateScrollIndicator() {
    const scrollTop = mainContent.scrollTop;
    const windowHeight = window.innerHeight;
    
    libros.forEach((libro, index) => {
      const libroTop = libro.offsetTop;
      const libroBottom = libroTop + libro.offsetHeight;
      
      if (scrollTop >= libroTop - windowHeight / 2 && scrollTop < libroBottom - windowHeight / 2) {
        scrollDots[index].classList.add('active');
      } else {
        scrollDots[index].classList.remove('active');
      }
    });
  }
  
  // Funcionalidad de like CORREGIDA
  likeButtons.forEach(button => {
    let likeCount = 0;
    const heart = button.querySelector('.heart');
    const count = button.querySelector('.count');
    
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      this.classList.toggle('liked');
      
      if (this.classList.contains('liked')) {
        likeCount++;
        heart.textContent = '❤️';
        heart.style.color = '#ff4757';
      } else {
        likeCount--;
        heart.textContent = '🤍';
        heart.style.color = '#fff';
      }
      
      count.textContent = likeCount;
      
      // Efecto de animación
      this.style.transform = 'scale(1.3)';
      setTimeout(() => {
        this.style.transform = 'scale(1.1)';
      }, 200);
    });
  });
  
  // Scroll suave
  mainContent.addEventListener('scroll', updateScrollIndicator);
  
  // Inicializar
  updateScrollIndicator();
  
  // Navegación con teclado
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIndex = Array.from(libros).findIndex(libro => {
        const rect = libro.getBoundingClientRect();
        return rect.top >= 0 && rect.top < window.innerHeight / 2;
      });
      
      if (e.key === 'ArrowDown' && currentIndex < libros.length - 1) {
        libros[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        libros[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});