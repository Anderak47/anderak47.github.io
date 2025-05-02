// modal-servicios.js

const servicios = {
    mantenimiento: {
        titulo: "Mantenimiento de Radiadores",
        descripcion: "Realizamos una limpieza profunda desmontando la tina y destapando núcleo por núcleo para eliminar sedimentos, óxido y obstrucciones. Esto garantiza el flujo óptimo del líquido refrigerante y evita el sobrecalentamiento del motor.",
        imagen: "/img/mantenimiento.webp"
    },
    fabricacion: {
        titulo: "Fabricación de Radiadores y Tinas",
        descripcion: "Fabricamos radiadores y tinas en aluminio o bronce, replicando el diseño original pero mejorando su resistencia y calidad.",
        imagen: "/img/fabricacion.webp"
    },
    reparacion: {
        titulo: "Reparación de Radiadores",
        descripcion: "Soldadura profesional de fisuras en radiadores, intercoolers o enfriadores de aceite. Usamos aluminio o bronce según el material, eliminando fugas y recuperando su funcionamiento óptimo.",
        imagen: "/img/reparacion.webp"
    },
    reconstruccion: {
        titulo: "Reconstrucción de Radiadores",
        descripcion: "Reconstruimos radiadores a nivel estructural: desmontamos tinas y panal, reforzamos sus componentes críticos y los reensamblamos con soldadura de alta resistencia, superando los estándares originales",
        imagen: "/img/reconstruccion.webp"
    },
    venta: {
        titulo: "Venta",
        descripcion: "Contamos con una amplia gama de productos disponibles para el cliente, incluyendo radiadores, intercoolers, condensadores, calefactores, ventiladores, refrigerantes y accesorios en general para vehículos livianos y pesados.",
        imagen: "/img/venta.webp"
    },
    delivery: {
        titulo: "Delivery",
        descripcion: "Necesitas un radiador nuevo o reparado? Te lo entregamos donde estés. Venta, fabricación y delivery especializado.",
        imagen: "/img/delivery.webp"
    }
};

window.mostrarModal = function (servicioId) {
    const servicio = servicios[servicioId];
    if (!servicio) return;

    document.getElementById('modal-titulo').textContent = servicio.titulo;
    document.getElementById('modal-descripcion').textContent = servicio.descripcion;

    const modalImg = document.getElementById('modal-imagen');
    modalImg.src = servicio.imagen;
    modalImg.alt = servicio.titulo;

    const modal = document.getElementById('modal');
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // 🔽 Enfocamos el título para que el lector lo lea
    const tituloModal = document.getElementById('modal-titulo');
    tituloModal.focus();
};

window.cerrarModal = function () {
    const modal = document.getElementById('modal');
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
};

window.addEventListener('click', function (event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        cerrarModal();
    }
});

document.addEventListener('keydown', function (event) {
    const modal = document.getElementById('modal');
    if (event.key === 'Escape' && modal.style.display === 'flex') {
        cerrarModal();
    }
});
