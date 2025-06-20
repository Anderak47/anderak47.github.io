function setupProductModal(config) {
    const {
        dataSource,
        modalId,
        btnId,
        defaultCategory,
        tabSelector,
        sliderId,
        dotsId,
        titleId,
        descriptionId,
        hasTabs = true
    } = config;

    let currentCategory = defaultCategory || Object.keys(dataSource)[0];
    let currentProductIndex = 0;
    let autoplayInterval;
    let touchStartX = 0;
    let touchEndX = 0;

    // Configurar botones de apertura
    document.querySelector(btnId)?.addEventListener('click', function() {
        abrirModal(modalId);
        if (hasTabs) {
            cargarCategoria(currentCategory);
        } else {
            currentCategory = Object.keys(dataSource)[0];
            cargarProductos();
            iniciarAutoplay();
        }
    });

    // Event listeners del modal
    document.querySelector(`#${modalId} .cerrar-modal`).addEventListener('click', () => cerrarModal(modalId));
    document.getElementById(modalId).addEventListener('click', function(e) {
        if (e.target === this) cerrarModal(modalId);
    });

    // Configurar pestañas de categoría
    if (hasTabs && tabSelector) {
        document.querySelectorAll(`${tabSelector} .modal-tab`).forEach(tab => {
            tab.addEventListener('click', function() {
                cargarCategoria(this.dataset.categoria);
            });
        });
    } else {
        // Ocultar elementos de pestañas si no son necesarios
        const tabsContainer = document.querySelector(tabSelector);
        if (tabsContainer) {
            tabsContainer.style.display = 'none';
        }

        // Ajustar el header para modales sin pestañas
        const modalHeader = document.querySelector(`#${modalId} .modal-header`);
        if (modalHeader) {
            modalHeader.style.paddingBottom = '25px';
            modalHeader.style.borderBottom = 'none';
        }
    }

    // Función para cargar categoría
    function cargarCategoria(categoria) {
        currentCategory = categoria || currentCategory;
        currentProductIndex = 0;
        clearAutoplay();

        if (hasTabs && tabSelector) {
            document.querySelectorAll(`${tabSelector} .modal-tab`).forEach(tab => {
                tab.classList.toggle('active', tab.dataset.categoria === categoria);
            });
        }

        cargarProductos();
        iniciarAutoplay();
    }

    // Función para cargar productos
    function cargarProductos() {
        const productos = dataSource[currentCategory];
        const slider = document.getElementById(sliderId);
        const dotsContainer = document.getElementById(dotsId);

        // Limpiar slider y dots
        slider.innerHTML = '';
        dotsContainer.innerHTML = '';

        // Crear slides y dots
        productos.forEach((producto, index) => {
            // Crear slide
            const slide = document.createElement('div');
            slide.className = 'producto-slide';
            let claseImagen;
            switch (currentCategory) {
                case 'canieriaAgua':
                    claseImagen = 'img-pequena'; // 300px
                    break;
                default:
                    claseImagen = 'img-normal'; // 478px
            }
            
            // Usamos data-src para carga perezosa
            slide.innerHTML = `
                <img data-src="${producto.imagenes[0]}" 
                     alt="${producto.titulo}" 
                     class="producto-imagen ${claseImagen}">
            `;
            slider.appendChild(slide);

            // Crear dot
            const dot = document.createElement('div');
            dot.className = 'productos-dot';
            if (index === 0) dot.classList.add('active');

            dot.addEventListener('click', () => {
                mostrarProducto(index);
                reiniciarAutoplay();
            });

            dotsContainer.appendChild(dot);
        });

        // Configurar eventos de touch después de crear los slides
        setupTouchEvents();
        
        // Cargar la primera imagen inmediatamente
        if (productos.length > 0) {
            loadImage(0);
            mostrarProducto(0);
        }
        
        if (!hasTabs) {
            iniciarAutoplay();
        }
    }

    // Configurar eventos táctiles
    function setupTouchEvents() {
        const slider = document.getElementById(sliderId);
        if (!slider) return;

        slider.addEventListener('touchstart', handleTouchStart, { passive: true });
        slider.addEventListener('touchmove', handleTouchMove, { passive: true });
        slider.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        clearAutoplay(); // Pausar autoplay durante interacción
    }

    function handleTouchMove(e) {
        touchEndX = e.touches[0].clientX;
        const slider = document.getElementById(sliderId);
        if (!slider) return;

        const diff = touchEndX - touchStartX;
        slider.style.transform = `translateX(calc(-${currentProductIndex * 100}% + ${diff}px)`;
        slider.style.transition = 'none';
    }

    function handleTouchEnd() {
        const slider = document.getElementById(sliderId);
        if (!slider) return;

        const threshold = 50; // Mínimo desplazamiento para considerar swipe
        const diff = touchEndX - touchStartX;
        const productos = dataSource[currentCategory];
        
        // Restablecer transformación
        slider.style.transform = `translateX(-${currentProductIndex * 100}%)`;
        slider.style.transition = 'transform 0.5s ease-in-out';

        // Determinar dirección del swipe
        if (Math.abs(diff) > threshold) {
            if (diff > 0) { // Swipe derecha (anterior)
                if (currentProductIndex > 0) {
                    mostrarProducto(currentProductIndex - 1);
                }
            } else { // Swipe izquierda (siguiente)
                if (currentProductIndex < productos.length - 1) {
                    mostrarProducto(currentProductIndex + 1);
                }
            }
        }
        
        reiniciarAutoplay();
    }

    // Carga perezosa de imágenes
    function loadImage(index) {
        const slides = document.querySelectorAll(`#${sliderId} .producto-slide`);
        if (index < 0 || index >= slides.length) return;

        const img = slides[index].querySelector('img');
        if (img && img.dataset.src && !img.src) {
            img.src = img.dataset.src;
        }
    }

    // Función para mostrar un producto específico
    function mostrarProducto(index) {
        const productos = dataSource[currentCategory];
        if (!productos || index < 0 || index >= productos.length) return;

        currentProductIndex = index;
        const slider = document.getElementById(sliderId);
        const dots = document.querySelectorAll(`#${dotsId} .productos-dot`);
        const modal = document.getElementById(modalId);

        // Mover slider
        slider.style.transform = `translateX(-${index * 100}%)`;
        slider.style.transition = 'transform 0.5s ease-in-out';

        // Actualizar dots activos
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        // Actualizar información del producto
        modal.querySelector(`#${titleId}`).textContent = productos[index].titulo;
        modal.querySelector(`#${descriptionId}`).textContent = productos[index].descripcion;

        // Cargar imagen actual y precargar adyacentes
        loadImage(index);
        loadImage(index - 1);
        loadImage(index + 1);
    }

    function iniciarAutoplay() {
        const productos = dataSource[currentCategory];
        if (!productos || productos.length <= 1) return;
        clearAutoplay();

        autoplayInterval = setInterval(() => {
            const newIndex = (currentProductIndex + 1) % productos.length;
            mostrarProducto(newIndex);
        }, 3000); // Cambia cada 3 segundos
    }

    function reiniciarAutoplay() {
        clearAutoplay();
        iniciarAutoplay();
    }

    function clearAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }
}
// Configuración para radiadores
const radiadoresConfig = {
    dataSource: {
        livianos: [
            {
                titulo: "Radiador Suzuki",
                descripcion: "SWIFT 2012",
                imagenes: ["/img/suzukir.webp"]
            },
            {
                titulo: "Radiador Volkswagen",
                descripcion: "FOX 2005-2007",
                imagenes: ["/img/volkswagenr.webp"]
            },
            {
                titulo: "Radiador Peugeot",
                descripcion: "PEUGEOT 307",
                imagenes: ["/img/peugeotr.webp"]
            },
            {
                titulo: "Radiador Nissan",
                descripcion: "XTRAIL 2007_2010",
                imagenes: ["/img/nissanr.webp"]
            },
            {
                titulo: "Radiador Nissan",
                descripcion: "SENTRA GASOLINERO 1992-2015",
                imagenes: ["/img/nissansentra.webp"]
            },
            {
                titulo: "Radiador Nissan",
                descripcion: "NAVARA 2005-2011",
                imagenes: ["/img/nissannavara.webp"]
            },
            {
                titulo: "Radiador Mittsubishi",
                descripcion: "L200 2007-2013",
                imagenes: ["/img/mittsubishitriton.webp"]
            },
            {
                titulo: "Radiador Jac",
                descripcion: "J3 2015",
                imagenes: ["/img/jacj3.webp"]
            },
            {
                titulo: "Radiador Hyundai",
                descripcion: "ELANTRA 2005",
                imagenes: ["/img/hyundaielantra.webp"]
            },
            {
                titulo: "Radiador Toyota",
                descripcion: "HIACE 5L 2010",
                imagenes: ["/img/hiace5l.webp"]
            },

        ],
        pesados: [
            {
                titulo: "Radiador Freightliner",
                descripcion: "FREIGHTLINER",
                imagenes: ["/img/freightliner.webp"]
            },
            {
                titulo: "Radiador Hino",
                descripcion: "HINO 500",
                imagenes: ["/img/hino500.webp"]
            },
            {
                titulo: "Radiador Volvo",
                descripcion: "FM",
                imagenes: ["/img/volvoFm.webp"]
            },
            {
                titulo: "Radiador Mitsubishi",
                descripcion: "FUSO FIGHTER 1999-2005",
                imagenes: ["/img/fusoFighter.webp"]
            },
            {
                titulo: "Radiador Isuzu",
                descripcion: "ISUZU 500 2014",
                imagenes: ["/img/izusu500.webp"]
            },
            {
                titulo: "Radiador Volvo",
                descripcion: "FH12",
                imagenes: ["/img/volvofh12.webp"]
            },
            {
                titulo: "Radiador Mitsubishi",
                descripcion: "FUSO CANTER 2014",
                imagenes: ["/img/canter2014.webp"]
            },
            {
                titulo: "Radiador Volvo",
                descripcion: "FMX480",
                imagenes: ["/img/volvoFMX480.webp"]
            }
        ],
        linea_amarilla: [
            {
                titulo: "Cargador Frontal",
                descripcion: "CAT 966H",
                imagenes: ["/img/cargaFrontal.webp"]
            },
            {
                titulo: "Excavadora Caterpillar",
                descripcion: "CAT 320D",
                imagenes: ["/img/cargadorKomatsu.webp"]
            },
            {
                titulo: "Excavadora",
                descripcion: "CAT 320D",
                imagenes: ["/img/excavadora320d.webp"]
            },
            {
                titulo: "Excavadora Caterpillar",
                descripcion: "CAT 349",
                imagenes: ["/img/excavadora349.webp"]
            },
            {
                titulo: "Excavadora Komatsu",
                descripcion: "PC-350",
                imagenes: ["/img/excavadoraKomatsu350.webp"]
            },
            {
                titulo: "Excavadora Caterpillar",
                descripcion: "CAT 336D",
                imagenes: ["/img/excavadora336.webp"]
            },
            {
                titulo: "Excavadora Caterpillar",
                descripcion: "CAT 320DL",
                imagenes: ["/img/excabadoraCat320DL.webp"]
            },
            {
                titulo: "Montacarga",
                descripcion: "HYSTER",
                imagenes: ["/img/montacargasHyster.webp"]
            },
            {
                titulo: "Intercooler",
                descripcion: "CAT 336",
                imagenes: ["/img/intercoolersCat336.webp"]
            },
        ]
    },
    modalId: 'modal-productos',
    btnId: '#btn-info-radiadores',
    defaultCategory: 'livianos',
    tabSelector: '#modal-productos .modal-tabs',
    sliderId: 'radiadores-slider',
    dotsId: 'radiadores-dots',
    titleId: 'radiadores-titulo',
    descriptionId: 'radiadores-descripcion'
};

// Configuración para accesorios
const accesoriosConfig = {
    dataSource: {
        bridas: [
            {
                titulo: "Brida Modelo Standard",
                descripcion: "Brida de alta resistencia para conexiones seguras.",
                imagenes: ["/img/kiaBrida.webp"]
            },
            {
                titulo: "Brida Modelo Premium",
                descripcion: "Brida de máxima durabilidad para usos intensivos.",
                imagenes: ["/img/hiace3lBrida.webp"]
            },
            {
                titulo: "Brida Modelo Premium",
                descripcion: "Brida de máxima durabilidad para usos intensivos.",
                imagenes: ["/img/mitsubishilancerBrida.webp"]
            },
            {
                titulo: "Brida Modelo Premium",
                descripcion: "Brida de máxima durabilidad para usos intensivos.",
                imagenes: ["/img/hyundaihd65Brida.webp"]
            },
            {
                titulo: "Brida Modelo Premium",
                descripcion: "Brida de máxima durabilidad para usos intensivos.",
                imagenes: ["/img/kia2012Brida.webp"]
            },
            {
                titulo: "Brida Modelo Premium",
                descripcion: "Brida de máxima durabilidad para usos intensivos.",
                imagenes: ["/img/nissansunnyBrida.webp"]
            },
            {
                titulo: "Brida Modelo Premium",
                descripcion: "Brida de máxima durabilidad para usos intensivos.",
                imagenes: ["/img/toyotayaris2014Brida.webp"]
            },
            {
                titulo: "Brida Modelo Premium",
                descripcion: "Brida de máxima durabilidad para usos intensivos.",
                imagenes: ["/img/nissanadBrida.webp"]
            },
            {
                titulo: "Brida Modelo Premium",
                descripcion: "Brida de máxima durabilidad para usos intensivos.",
                imagenes: ["/img/suzukivitaraBrida.webp"]
            },
            {
                titulo: "Brida Modelo Premium",
                descripcion: "Brida de máxima durabilidad para usos intensivos.",
                imagenes: ["/img/mitsubishicanterrosaBrida.webp"]
            }
        ],
        tapas: [
            {
                titulo: "Tapa Radiador Aluminio",
                descripcion: "Tapa de aluminio de alta calidad.",
                imagenes: ["/img/tapa1.webp"]
            },
            {
                titulo: "Tapa Radiador Acero",
                descripcion: "Tapa de acero resistente a la corrosión.",
                imagenes: ["/img/tapa2.webp"]
            },
            {
                titulo: "Tapa Radiador Acero",
                descripcion: "Tapa de acero resistente a la corrosión.",
                imagenes: ["/img/tapa3.webp"]
            },
            {
                titulo: "Tapa Radiador Acero",
                descripcion: "Tapa de acero resistente a la corrosión.",
                imagenes: ["/img/tapa4.webp"]
            },
            {
                titulo: "Tapa Radiador Acero",
                descripcion: "Tapa de acero resistente a la corrosión.",
                imagenes: ["/img/tapa5.webp"]
            },
            {
                titulo: "Tapa Radiador Acero",
                descripcion: "Tapa de acero resistente a la corrosión.",
                imagenes: ["/img/tapa6.webp"]
            },
            {
                titulo: "Tapa Radiador Acero",
                descripcion: "Tapa de acero resistente a la corrosión.",
                imagenes: ["/img/tapa7.webp"]
            },
            
        ],
        tanques: [
            {
                titulo: "Tanque Expansión Universal",
                descripcion: "Tanque de expansión para diversos modelos.",
                imagenes: ["/img/chevroletsonicTanque.webp"]
            },
            {
                titulo: "Tanque Expansión Premium",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/tanque2.webp"]
            },
            {
                titulo: "Tanque Expansión Premium",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/tanque3.webp"]
            },
            {
                titulo: "Tanque Expansión Premium",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/tanque4.webp"]
            },
            {
                titulo: "Tanque Expansión Premium",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/tanque5.webp"]
            },
            {
                titulo: "Tanque Expansión Premium",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/tanque6.webp"]
            }
        ],
        canieriaAgua: [
            {
                titulo: "cañeria 1",
                descripcion: "Tanque de expansión para diversos modelos.",
                imagenes: ["/img/carrochinoCanieria.webp"]
            },
            {
                titulo: "cañeria 2",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/chevroletaveoCanieria.webp"]
            },
            {
                titulo: "cañeria 2",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/chevroletprismaCanieria.webp"]
            },
            {
                titulo: "cañeria 2",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/removebgCanieria.webp"]
            },
            {
                titulo: "cañeria 2",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/hyundaiaccentCanieria.webp"]
            },
            {
                titulo: "cañeria 2",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/lifanbydCanieria.webp"]
            },
            {
                titulo: "cañeria 2",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/nissanmarchCanieria.webp"]
            },
            {
                titulo: "cañeria 2",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/nissanCanieria.webp"]
            },
            {
                titulo: "cañeria 2",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/renaultloganCanieria.webp"]
            },
            {
                titulo: "cañeria 2",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/toyotaavanzaCanieria.webp"]
            },
            {
                titulo: "cañeria 2",
                descripcion: "Tanque de expansión de alta capacidad.",
                imagenes: ["/img/toyotacorollaCanieria.webp"]
            },
        ]
    },
    modalId: 'modal-accesorios',
    btnId: '#btn-info-accesorios',
    defaultCategory: 'bridas',
    tabSelector: '#modal-accesorios .modal-tabs',
    sliderId: 'accesorios-slider',
    dotsId: 'accesorios-dots',
    titleId: 'accesorios-titulo',
    descriptionId: 'accesorios-descripcion'
};

// Configuración para refrigerantes
const refrigerantesConfig = {
    dataSource: {
        galon: [
            {
                titulo: "Anticongelante Galón Verde",
                descripcion: "Protección óptima para climas fríos, presentación en galón.",
                imagenes: ["/img/prestoneAmarillo.webp"]
            },
            {
                titulo: "Anticongelante Galón Rosa",
                descripcion: "Tecnología avanzada para motores modernos, galón.",
                imagenes: ["/img/vistonyRojo.webp"]
            },
            {
                titulo: "Anticongelante Galón Rosa",
                descripcion: "Tecnología avanzada para motores modernos, galón.",
                imagenes: ["/img/prestoneNegro.webp"]
            },
            {
                titulo: "Anticongelante Galón Rosa",
                descripcion: "Tecnología avanzada para motores modernos, galón.",
                imagenes: ["/img/TripleAccionRojo.webp"]
            },
            {
                titulo: "Anticongelante Galón Rosa",
                descripcion: "Tecnología avanzada para motores modernos, galón.",
                imagenes: ["/img/aguaDesionizada.webp"]
            }
        ],
        balde: [
            {
                titulo: "Refrigerante Balde 5L",
                descripcion: "Rendimiento superior para flotas vehiculares.",
                imagenes: ["/img/fortalumValde.webp"]
            },
        ],
        aditivos: [
            {
                titulo: "Aditivo Refrigerante Concentrado",
                descripcion: "Mejora las propiedades del líquido refrigerante.",
                imagenes: ["/img/anticorrosivo.webp"]
            },
            {
                titulo: "Aditivo Sellador Radiador",
                descripcion: "Sella pequeñas fugas en el sistema de refrigeración.",
                imagenes: ["/img/rostOff.webp"]
            },
            {
                titulo: "Aditivo Sellador Radiador",
                descripcion: "Sella pequeñas fugas en el sistema de refrigeración.",
                imagenes: ["/img/metalLiquidoFE1.webp"]
            }
        ]
    },
    modalId: 'modal-refrigerantes',
    btnId: '#btn-info-refrigerantes',
    defaultCategory: 'galon',
    tabSelector: '#modal-refrigerantes .modal-tabs',
    sliderId: 'refrigerantes-slider',
    dotsId: 'refrigerantes-dots',
    titleId: 'refrigerantes-titulo',
    descriptionId: 'refrigerantes-descripcion'
};

const condensadoresConfig = {
    dataSource: {
        // Solo una categoría directa (sin pestañas)
        condensadores: [
            {
                titulo: "Condensador Hilux",
                descripcion: "REVO/1GD 2017",
                imagenes: ["/img/condensadores1.webp"]
            },
            {
                titulo: "Condensador Kia",
                descripcion: "SPORTAGE",
                imagenes: ["/img/kiasportageCondensador.webp"]
            },
            {
                titulo: "Condensador Suzuki",
                descripcion: "SWIFT",
                imagenes: ["/img/suzukiswiftCondensador.webp"]
            },
            {
                titulo: "Condensador Yaris",
                descripcion: "ENVIDIA 2015",
                imagenes: ["/img/yarisenvidia2015Condensador.webp"]
            },
            {
                titulo: "Condensador Toyota",
                descripcion: "RAV4 2007",
                imagenes: ["/img/toyotarav42007Condensador.webp"]
            },
            {
                titulo: "Condensador Nissan",
                descripcion: "TIIDA 2006-2013",
                imagenes: ["/img/nissantiidaCondensadores.webp"]
            }
        ]
    },
    modalId: 'modal-condensadores',
    btnId: '#btn-info-condensadores',
    sliderId: 'condensadores-slider',
    dotsId: 'condensadores-dots',
    titleId: 'condensadores-titulo',
    descriptionId: 'condensadores-descripcion',
    hasTabs: false
};

const intercoolersConfig = {
    dataSource: {
        // Solo una categoría para intercoolers
        todos: [
            {
                titulo: "Intercooler Modelo Turbo",
                descripcion: "Enfriador de aire de alto rendimiento para turbos.",
                imagenes: ["/img/tritonL200.webp"]
            },
            {
                titulo: "Intercooler Modelo Race",
                descripcion: "Diseño de competición para máxima eficiencia.",
                imagenes: ["/img/hilux1kd.webp"]
            }
        ]
    },
    modalId: 'modal-intercoolers',
    btnId: '#btn-info-intercoolers',
    sliderId: 'intercoolers-slider',
    dotsId: 'intercoolers-dots',
    titleId: 'intercoolers-titulo',
    descriptionId: 'intercoolers-descripcion',
    hasTabs: false
};

const ventiladoresConfig = {
    dataSource: {
        // Categoría única para ventiladores
        todos: [
            {
                titulo: "Ventilador Eléctrico 12V",
                descripcion: "Ventilador de alto flujo para sistemas de enfriamiento.",
                imagenes: ["/img/ventiladorYaris.webp"]
            },
            {
                titulo: "Ventilador Industrial",
                descripcion: "Alta resistencia para uso continuo en maquinaria pesada.",
                imagenes: ["/img/hyundaiL20.webp"]
            },
            {
                titulo: "Kit Ventilador + Controlador",
                descripcion: "Solución completa con control de temperatura integrado.",
                imagenes: ["/img/hyundaiElantra2017.webp"]
            },
            {
                titulo: "Kit Ventilador + Controlador",
                descripcion: "Solución completa con control de temperatura integrado.",
                imagenes: ["/img/ventilador1.webp"]
            }
        ]
    },
    modalId: 'modal-ventiladores',
    btnId: '#btn-info-ventiladores',
    sliderId: 'ventiladores-slider',
    dotsId: 'ventiladores-dots',
    titleId: 'ventiladores-titulo',
    descriptionId: 'ventiladores-descripcion',
    hasTabs: false
};

const calefactoresConfig = {
    dataSource: {
        // Categoría única para calefactores
        todos: [
            {
                titulo: "Calefactor Eléctrico 24V",
                descripcion: "Sistema de calefacción rápida para cabinas.",
                imagenes: ["/img/toyotaYaris2025.webp"]
            },
            {
                titulo: "Calefactor Diésel",
                descripcion: "Alto rendimiento para vehículos pesados.",
                imagenes: ["/img/mitsubishiFuso.webp"]
            },
            {
                titulo: "Kit Calefacción Completo",
                descripcion: "Incluye calefactor, termostato y controles.",
                imagenes: ["/img/hino500c.webp"]
            },
            {
                titulo: "Kit Calefacción Completo",
                descripcion: "Incluye calefactor, termostato y controles.",
                imagenes: ["/img/HyundaiHD65.webp"]
            },
            {
                titulo: "Kit Calefacción Completo",
                descripcion: "Incluye calefactor, termostato y controles.",
                imagenes: ["/img/mercedesCalefactores.webp"]
            },
            {
                titulo: "Kit Calefacción Completo",
                descripcion: "Incluye calefactor, termostato y controles.",
                imagenes: ["/img/hyundaiAccent.webp"]
            },
            {
                titulo: "Kit Calefacción Completo",
                descripcion: "Incluye calefactor, termostato y controles.",
                imagenes: ["/img/izuzuCalefactores.webp"]
            },
            {
                titulo: "Kit Calefacción Completo",
                descripcion: "Incluye calefactor, termostato y controles.",
                imagenes: ["/img/hiluxRevo.webp"]
            },
            {
                titulo: "Kit Calefacción Completo",
                descripcion: "Incluye calefactor, termostato y controles.",
                imagenes: ["/img/hilux1kdCalefactor.webp"]
            }
        ]
    },
    modalId: 'modal-calefactores',
    btnId: '#btn-info-calefactores',
    sliderId: 'calefactores-slider',
    dotsId: 'calefactores-dots',
    titleId: 'calefactores-titulo',
    descriptionId: 'calefactores-descripcion',
    hasTabs: false
};
const fabricacionConfig = {
    dataSource: {
        aluminio: [
            {
                titulo: "0",
                descripcion: "Protección óptima para climas fríos, presentación en galón.",
                imagenes: ["/img/radiador1.webp"]
            },
            {
                titulo: "1",
                descripcion: "Tecnología avanzada para motores modernos, galón.",
                imagenes: ["/img/excabadoraSany.webp"]
            },
            {
                titulo: "2",
                descripcion: "Tecnología avanzada para motores modernos, galón.",
                imagenes: ["/img/camionJac.webp"]
            },
            {
                titulo: "3",
                descripcion: "Tecnología avanzada para motores modernos, galón.",
                imagenes: ["/img/hino500Fabricacion.webp"]
            },
            {
                titulo: "4",
                descripcion: "Tecnología avanzada para motores modernos, galón.",
                imagenes: ["/img/radiador2.webp"]
            },
            {
                titulo: "5",
                descripcion: "Tecnología avanzada para motores modernos, galón.",
                imagenes: ["/img/excabadora349.webp"]
            }
        ],
        bronce: [
            {
                titulo: "1",
                descripcion: "Rendimiento superior para flotas vehiculares.",
                imagenes: ["/img/hyundaiHD65Fabricacion.webp"]
            },
            {
                titulo: "1",
                descripcion: "Rendimiento superior para flotas vehiculares.",
                imagenes: ["/img/radiador3Fabricacion.webp"]
            },
            {
                titulo: "1",
                descripcion: "Rendimiento superior para flotas vehiculares.",
                imagenes: ["/img/volvoFabricacion.webp"]
            },
            {
                titulo: "1",
                descripcion: "Rendimiento superior para flotas vehiculares.",
                imagenes: ["/img/hiluxAntiguaFabricacion.webp"]
            },
            {
                titulo: "1",
                descripcion: "Rendimiento superior para flotas vehiculares.",
                imagenes: ["/img/radiador4Fabricacion.webp"]
            },
            {
                titulo: "1",
                descripcion: "Rendimiento superior para flotas vehiculares.",
                imagenes: ["/img/torreIluminacionTerex.webp"]
            },
            {
                titulo: "1",
                descripcion: "Rendimiento superior para flotas vehiculares.",
                imagenes: ["/img/radiador5Fabricacion.webp"]
            },
            {
                titulo: "1",
                descripcion: "Rendimiento superior para flotas vehiculares.",
                imagenes: ["/img/comprensorFabricacion.webp"]
            },
        ],
       
    },
    modalId: 'modal-fabricacion',
    btnId: '#btn-info-fabricacion',
    defaultCategory: 'aluminio',
    tabSelector: '#modal-fabricacion .modal-tabs',
    sliderId: 'fabricacion-slider',
    dotsId: 'fabricacion-dots',
    titleId: 'fabricacion-titulo',
    descriptionId: 'fabricacion-descripcion'
};
// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    setupProductModal(radiadoresConfig);
    setupProductModal(accesoriosConfig);
    setupProductModal(refrigerantesConfig);
    setupProductModal(condensadoresConfig);
    setupProductModal(intercoolersConfig);
    setupProductModal(ventiladoresConfig);
    setupProductModal(calefactoresConfig);
    setupProductModal(fabricacionConfig);
});