// Inicialización del Swiper (solo para index)
function initSwiper() {
    return new Swiper(".swiper-container", {
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true
        },
        slidesPerView: 1,
        spaceBetween: 25,
    });
}

// Lazy load para video
function initLazyLoadVideo() {
    const video = document.querySelector(".lazy-load-video");
    if (!video) return null; // Solo si existe en la página

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            video.load();
            observer.unobserve(video);
        }
    }, { threshold: 0.1 });

    observer.observe(video);
    return observer;
}

// Comportamiento del botón de WhatsApp
function setupWhatsAppButton() {
    const whatsappBtn = document.querySelector(".whatsapp-btn");
    if (!whatsappBtn) return; // Solo si existe

    function checkVisibility() {
        const section1 = document.querySelector("#inicio");
        if (!section1) return; // Solo si existe

        const section1Rect = section1.getBoundingClientRect();
        whatsappBtn.classList.toggle("hidden", section1Rect.bottom > 0);
    }

    window.addEventListener("scroll", checkVisibility);
    checkVisibility(); // Ejecutar inmediatamente
}

// Inicializar solo las funciones necesarias para esta página
document.addEventListener("DOMContentLoaded", function() {
    // Verificar si estamos en la página index (por la presencia de elementos únicos)
    if (document.querySelector(".swiper-container")) {
        initSwiper();
        initLazyLoadVideo();
        setupWhatsAppButton();
    }
});