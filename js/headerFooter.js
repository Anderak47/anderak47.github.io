document.addEventListener('DOMContentLoaded', function() {
    const loadComponents = async () => {
        // 1. Obtener contenedores primero
        const headerContainer = document.getElementById('header-container');
        const footerContainer = document.getElementById('footer-container');
        
        // 2. Verificar que los contenedores existen
        if (!headerContainer) {
            console.error('No se encontró el elemento con ID header-container');
            return;
        }
        
        if (!footerContainer) {
            console.warn('No se encontró el elemento con ID footer-container');
            // No hacemos return porque el header es más importante
        }

        try {
            // 3. Usar rutas absolutas desde la raíz del sitio
            const baseUrl = window.location.origin;
            const [headerResponse, footerResponse] = await Promise.all([
                fetch(`${baseUrl}/html/header.html`),
                footerContainer ? fetch(`${baseUrl}/html/footer.html`) : Promise.resolve(null)
            ]);

            // 4. Procesar header
            if (!headerResponse.ok) {
                throw new Error(`Error al cargar header: ${headerResponse.status}`);
            }
            headerContainer.innerHTML = await headerResponse.text();

            // 5. Procesar footer solo si existe el contenedor
            if (footerContainer && footerResponse) {
                if (!footerResponse.ok) {
                    console.warn(`Error al cargar footer: ${footerResponse.status}`);
                } else {
                    footerContainer.innerHTML = await footerResponse.text();
                }
            }
            
            // 6. Disparar evento cuando todo esté listo
            document.dispatchEvent(new CustomEvent('componentsLoaded', {
                detail: {
                    headerLoaded: true,
                    footerLoaded: !!footerContainer
                }
            }));

        } catch (error) {
            console.error('Error al cargar componentes:', error);
            
            // 7. Contenido de fallback
            headerContainer.innerHTML = `
                <nav class="navbar navbar-expand-lg navbar-light bg-light">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="#">Radiadores Alvites</a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav">
                                <li class="nav-item">
                                    <a class="nav-link active" href="/">Inicio</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            `;
            
            if (footerContainer) {
                footerContainer.innerHTML = `
                    <div class="bg-dark text-white text-center p-3">
                        © ${new Date().getFullYear()} Radiadores Alvites Cajamarca
                    </div>
                `;
            }
        }
    };

    loadComponents();
});