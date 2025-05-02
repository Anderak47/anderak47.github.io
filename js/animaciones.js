document.addEventListener('DOMContentLoaded', function() {
    // Función 1: Animaciones con IntersectionObserver
    const observer = new IntersectionObserver(
        (entries) => {
            const modalAbierto = document.querySelector('.modal-productos[style*="display: flex"]');
            
            entries.forEach(entry => {
                if (modalAbierto) {
                    entry.target.classList.remove('visible');
                    return;
                }

                if (!entry.isIntersecting) {
                    entry.target.classList.remove('visible');
                } else {
                    entry.target.classList.add('visible');
                }
            });
        }, 
        {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        }
    );

    document.querySelectorAll('.textLlamativo, .fade-in, .slide-up').forEach(element => {
        observer.observe(element);
    });

    // Función 2: Efecto 3D en el logo (solo si existe)
    const logoContainer = document.querySelector('.logo-3d-container');
    const logo = document.querySelector('.logo-3d');

    if (logoContainer && logo) {
        logoContainer.addEventListener('mousemove', (e) => {
            const rect = logoContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = (centerY - y) / 10;
            const tiltY = (x - centerX) / 10;

            logo.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });

        logoContainer.addEventListener('mouseleave', () => {
            logo.style.transform = 'rotateX(0) rotateY(0)';
        });
    }
});
