// Variables globales para controlar el slider principal
let mainSliderAutoplay;
let currentIndex = 0;

document.addEventListener('DOMContentLoaded', function () {
    setupMainSlider();
});

// Función para el slider principal
function setupMainSlider() {
    const slider = document.querySelector('.split-slider');
    const slides = document.querySelectorAll('.split-slide');
    const dotsContainer = document.getElementById('slider-dots');
    const slideCount = slides.length;

    function createDots() {
        dotsContainer.innerHTML = '';
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === currentIndex) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });
    }

    function goToSlide(index) {
        if (index < 0) index = slideCount - 1;
        if (index >= slideCount) index = 0;

        currentIndex = index;
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateDots();
    }

    function updateDots() {
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    createDots();

    setupTouchSliderWithHold(
        slider,
        (delta) => goToSlide(currentIndex + delta),
        stopMainSliderAutoplay,
        startMainSliderAutoplay
    );
    // Iniciar autoplay
    startMainSliderAutoplay();
    slider.addEventListener('mouseenter', stopMainSliderAutoplay);
    slider.addEventListener('mouseleave', startMainSliderAutoplay);

}
function startMainSliderAutoplay() {
    // Si ya hay un intervalo, no crear otro
    if (mainSliderAutoplay) return;

    const slider = document.querySelector('.split-slider');
    const slides = document.querySelectorAll('.split-slide');
    const slideCount = slides.length;

    mainSliderAutoplay = setInterval(() => {
        currentIndex = (currentIndex + 1) % slideCount;
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Actualizar dots
        document.querySelectorAll('#slider-dots .dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }, 5000);
}

function stopMainSliderAutoplay() {
    if (mainSliderAutoplay) {
        clearInterval(mainSliderAutoplay);
        mainSliderAutoplay = null;
    }
}
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    modal.removeAttribute('aria-hidden'); // Mostrarlo al lector de pantalla
    document.body.style.overflow = 'hidden';
    stopMainSliderAutoplay();
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);

    // Quitar el foco de cualquier elemento dentro del modal
    if (modal.contains(document.activeElement)) {
        document.activeElement.blur(); // Esto saca el foco del botón/tab
    }

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';

    // Reanudar el slider si no hay otros modales abiertos
    if (!document.querySelector('.modal[style*="display: flex"]')) {
        const slider = document.querySelector('.split-slider');
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        startMainSliderAutoplay();
    }
}

function crearDots(sliderContainer, productos, mostrarProductoCallback, reiniciarAutoplayCallback) {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'productos-dots';

    productos.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'productos-dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            mostrarProductoCallback(index);
            if (reiniciarAutoplayCallback) reiniciarAutoplayCallback();
        });
        dotsContainer.appendChild(dot);
    });

    sliderContainer.appendChild(dotsContainer);
    return dotsContainer;
}

function setupTouchSliderWithHold(slider, goToSlide, stopAutoplay, startAutoplay) {
    let startX = 0;
    let isSwiping = false;
    let isHolding = false;
    let holdTimer = null;
    const holdThreshold = 300;

    slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isSwiping = false;
        isHolding = false;

        holdTimer = setTimeout(() => {
            isHolding = true;
            stopAutoplay();
        }, holdThreshold);
    }, { passive: true });

    slider.addEventListener('touchmove', (e) => {
        const diffX = e.touches[0].clientX - startX;
    
        if (Math.abs(diffX) > 10) {
            isSwiping = true;
            clearTimeout(holdTimer);
    
            // Solo prevenir si es cancelable
            if (e.cancelable && !e.defaultPrevented) {
                e.preventDefault();  
            }
        }
    }, { passive: false });  

    slider.addEventListener('touchend', (e) => {
        clearTimeout(holdTimer);

        if (isHolding) {
            isHolding = false;
            startAutoplay();
            return;
        }

        if (!isSwiping) return;

        const endX = e.changedTouches[0].clientX;
        const diffX = endX - startX;

        if (diffX > 50) {
            goToSlide(-1);
        } else if (diffX < -50) {
            goToSlide(1);
        }

        isSwiping = false;
    });

    slider.addEventListener('touchcancel', () => {
        clearTimeout(holdTimer);
        isHolding = false;
    });
}

