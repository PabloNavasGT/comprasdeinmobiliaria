document.addEventListener('DOMContentLoaded', () => {
    
    const modal = document.getElementById('modal-inmueble');
    const btnNuevo = document.getElementById('btn-nuevo');
    const closeBtn = document.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('inmueble-form');
    const btnGuardar = document.getElementById('btn-guardar');
    const propertyList = document.getElementById('property-list');
    const paginationContainer = document.getElementById('pagination-container');
    const contadorInmuebles = document.getElementById('contador-inmuebles');
    
    const inputBuscar = document.getElementById('input-buscar');
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroPrecio = document.getElementById('filtro-precio');
    
    const fotoUpload = document.getElementById('foto-upload');
    const previewImg = document.getElementById('preview-img');
    const btnFotoLabel = document.querySelector('.btn-foto'); 

    // Elementos de autenticación
    const modalLogin = document.getElementById('modal-login');
    const btnLoginOpen = document.getElementById('btn-login-open');
    const closeLoginBtn = document.querySelector('.close-login-btn');
    const loginForm = document.getElementById('login-form');
    const btnLogout = document.getElementById('btn-logout');
    const userDisplay = document.getElementById('user-display');
    
    let listaInmuebles = [];
    let paginaActual = 1;
    const itemsPorPagina = 3;
    
    const defaultImgUrl = "https://via.placeholder.com/300x300?text=Sin+Fachada";
    let imagenActualBase64 = defaultImgUrl; 

    // URL de tu Backend en Node.js / Express
    const API_URL = 'http://localhost:4000/api/inmuebles';
    const AUTH_URL = 'http://localhost:4000/api/auth';

    // VERIFICAR ESTADO DE LA SESIÓN Y ROLES
    function verificarEstadoSesion() {
        const token = localStorage.getItem('token');
        const rol = localStorage.getItem('rol');
        const nombre = localStorage.getItem('nombre');

        if (token) {
            if (btnLoginOpen) btnLoginOpen.style.display = 'none';
            if (btnLogout) btnLogout.style.display = 'block';
            if (userDisplay) userDisplay.textContent = `👤 ${nombre} (${rol ? rol.toUpperCase() : 'USER'})`;

            // Si es un usuario normal ('user'), ocultar el botón de crear inmueble
            if (rol !== 'admin' && btnNuevo) {
                btnNuevo.style.display = 'none';
            } else if (rol === 'admin' && btnNuevo) {
                btnNuevo.style.display = 'block';
            }
        } else {
            if (btnLoginOpen) btnLoginOpen.style.display = 'block';
            if (btnLogout) btnLogout.style.display = 'none';
            if (userDisplay) userDisplay.textContent = '';
            if (btnNuevo) btnNuevo.style.display = 'none'; // Los visitantes no pueden crear
        }
    }

    // GESTIÓN DEL MODAL DE LOGIN
    if (btnLoginOpen) {
        btnLoginOpen.onclick = () => {
            if (modalLogin) modalLogin.style.display = 'flex';
        };
    }
    if (closeLoginBtn) {
        closeLoginBtn.onclick = () => {
            if (modalLogin) modalLogin.style.display = 'none';
        };
    }

    // PROCESAR FORMULARIO DE LOGIN
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const res = await fetch(`${AUTH_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();

                if (data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('rol', data.usuario.rol);
                    localStorage.setItem('nombre', data.usuario.nombre);
                    
                    if (modalLogin) modalLogin.style.display = 'none';
                    loginForm.reset();
                    alert(`¡Bienvenido de nuevo, ${data.usuario.nombre}!`);
                    
                    verificarEstadoSesion();
                    obtenerInmueblesAPI();
                } else {
                    alert(data.message || 'Credenciales incorrectas');
                }
            } catch (err) {
                console.error('Error en el inicio de sesión:', err);
                alert('No se pudo conectar con el servidor de autenticación.');
            }
        });
    }

    // CERRAR SESIÓN
    if (btnLogout) {
        btnLogout.onclick = () => {
            localStorage.clear();
            alert('Sesión cerrada correctamente');
            verificarEstadoSesion();
            obtenerInmueblesAPI();
        };
    }

    // 1. CARGAR INMUEBLES DESDE MONGODB (API)
    async function obtenerInmueblesAPI() {
        try {
            const response = await fetch(API_URL);
            const resultado = await response.json();
            if (resultado.success) {
                listaInmuebles = resultado.data;
                renderizarTodo();
            }
        } catch (error) {
            console.error('Error al conectar con la API de MongoDB:', error);
            propertyList.innerHTML = `<p style="text-align:center; padding: 30px; color: #ef4444; font-weight: 500;">❌ Error de conexión con el servidor backend.</p>`;
        }
    }

    function obtenerInmueblesFiltrados() {
        const textoQuery = inputBuscar.value.toLowerCase().trim();
        const tipoQuery = filtroTipo.value;
        const rangoPrecioQuery = filtroPrecio.value;

        return listaInmuebles.filter(item => {
            const coincideTexto = !textoQuery || 
                item.direccion.toLowerCase().includes(textoQuery) || 
                item.ciudad.toLowerCase().includes(textoQuery);

            const coincideTipo = !tipoQuery || item.tipo === tipoQuery;

            let coincidePrecio = true;
            const valorNum = parseFloat(item.valor) || 0;

            if (rangoPrecioQuery === '0-500') {
                coincidePrecio = valorNum >= 0 && valorNum <= 500;
            } else if (rangoPrecioQuery === '500-4000') {
                coincidePrecio = valorNum > 500 && valorNum <= 4000;
            } else if (rangoPrecioQuery === '4000-up') {
                coincidePrecio = valorNum > 4000;
            }

            return coincideTexto && coincideTipo && coincidePrecio;
        });
    }

    function renderizarPropiedades() {
        propertyList.innerHTML = ''; 

        const filtrados = obtenerInmueblesFiltrados();
        contadorInmuebles.textContent = `Torres activas: ${filtrados.length}`;

        const inicio = (paginaActual - 1) * itemsPorPagina;
        const fin = inicio + itemsPorPagina;
        const inmueblesVisibles = filtrados.slice(inicio, fin);

        const rolActual = localStorage.getItem('rol');

        if (inmueblesVisibles.length === 0) {
            propertyList.innerHTML = `<p style="text-align:center; padding: 30px; color: #64748b; font-weight: 500;"> No se encontraron torres o inmuebles con los filtros seleccionados.</p>`;
            paginationContainer.innerHTML = '';
            return;
        }

        inmueblesVisibles.forEach((inmueble) => {
            const idInmueble = inmueble._id;

            const nuevaFila = document.createElement('div');
            nuevaFila.className = 'property-item';
            
            // Si es admin se muestra el botón eliminar, si no, se oculta visualmente
            const botonEliminarHtml = (rolActual === 'admin') 
                ? `<a href="#" class="btn-eliminar" style="color: #ef4444;">Eliminar</a>` 
                : '';

            nuevaFila.innerHTML = `
                <img src="${inmueble.foto || defaultImgUrl}" alt="${inmueble.tipo}">
                <div class="prop-type">
                    <strong> ${inmueble.tipo}</strong><br>
                    <small style="color:#64748b;">Niveles: ${inmueble.pisos}</small>
                </div>
                <span class="prop-address"> ${inmueble.direccion}, ${inmueble.ciudad}</span>
                <span class="prop-price"><strong>Q ${Number(inmueble.valor).toLocaleString()}</strong></span>
                <div class="prop-actions">
                    <a href="#" class="btn-ver">Ver</a>
                    ${botonEliminarHtml}
                </div>
            `;

            // 2. ELIMINAR DESDE LA API (MONGODB) CON AUTORIZACIÓN JWT
            const btnEliminarRef = nuevaFila.querySelector('.btn-eliminar');
            if (btnEliminarRef) {
                btnEliminarRef.onclick = async (ev) => {
                    ev.preventDefault();
                    if(confirm('¿Deseas demoler / eliminar este registro de la base de datos?')) {
                        try {
                            const response = await fetch(`${API_URL}/${idInmueble}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            });
                            
                            if (response.ok) {
                                await obtenerInmueblesAPI(); 
                            } else {
                                const errData = await response.json();
                                alert(errData.message || 'No se pudo eliminar el registro.');
                            }
                        } catch (error) {
                            console.error('Error al eliminar:', error);
                        }
                    }
                };
            }

            nuevaFila.querySelector('.btn-ver').onclick = (ev) => {
                ev.preventDefault();
                rellenarFormularioSoloVer(inmueble);
            };

            propertyList.appendChild(nuevaFila);
        });
        
        actualizarPaginacionUI(filtrados.length);
    }

    function actualizarPaginacionUI(totalItems) {
        const totalPaginas = Math.ceil(totalItems / itemsPorPagina) || 1;
        paginationContainer.innerHTML = '';

        const btnPrev = document.createElement('span');
        btnPrev.textContent = '◄';
        btnPrev.onclick = () => { if(paginaActual > 1) { paginaActual--; renderizarTodo(); } };
        paginationContainer.appendChild(btnPrev);

        for (let i = 1; i <= totalPaginas; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            if (i === paginaActual) span.className = 'active';
            span.onclick = () => { paginaActual = i; renderizarTodo(); };
            paginationContainer.appendChild(span);
        }

        const btnNext = document.createElement('span');
        btnNext.textContent = '►';
        btnNext.onclick = () => { if(paginaActual < totalPaginas) { paginaActual++; renderizarTodo(); } };
        paginationContainer.appendChild(btnNext);
    }

    function renderizarTodo() {
        renderizarPropiedades();
    }

    inputBuscar.addEventListener('input', () => { paginaActual = 1; renderizarTodo(); });
    filtroTipo.addEventListener('change', () => { paginaActual = 1; renderizarTodo(); });
    filtroPrecio.addEventListener('change', () => { paginaActual = 1; renderizarTodo(); });

    fotoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImg.src = event.target.result;
                imagenActualBase64 = event.target.result; 
            }
            reader.readAsDataURL(file);
        }
    });

    if (btnNuevo) {
        btnNuevo.addEventListener('click', () => {
            modalTitle.textContent = 'Nuevo Inmueble Urbano (MongoDB)';
            form.reset(); 
            setFormInputsState(false);
            btnGuardar.style.display = 'block';
            btnFotoLabel.style.display = 'inline-block';
            previewImg.src = defaultImgUrl;
            imagenActualBase64 = defaultImgUrl;
            modal.style.display = 'flex';
        });
    }

    // 3. CREAR / GUARDAR REGISTRO EN MONGODB VÍA API POST CON TOKEN JWT
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datosInmueble = {
            tipo: document.getElementById('tipo').value,
            direccion: document.getElementById('direccion').value,
            ciudad: document.getElementById('ciudad').value,
            departamento: document.getElementById('departamento').value,
            pisos: Number(document.getElementById('pisos').value),
            area: Number(document.getElementById('area').value) || undefined,
            matricula: document.getElementById('matricula').value,
            propietario: document.getElementById('propietario').value,
            valor: Number(document.getElementById('valor').value),
            comercial: document.getElementById('comercial').checked,
            descripcion: document.getElementById('descripcion').value,
            foto: imagenActualBase64
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(datosInmueble)
            });

            if (response.ok) {
                modal.style.display = 'none';
                await obtenerInmueblesAPI(); 
                alert("¡Torre / Inmueble registrado con éxito en MongoDB!");
            } else {
                const errData = await response.json();
                alert(errData.message || "Error al registrar el inmueble en el servidor.");
            }
        } catch (error) {
            console.error('Error al enviar los datos:', error);
        }
    });

    function rellenarFormularioSoloVer(datos) {
        modalTitle.textContent = 'Detalle de la Torre / Inmueble';
        setFormInputsState(true);
        btnGuardar.style.display = 'none';
        btnFotoLabel.style.display = 'none';
        
        document.getElementById('tipo').value = datos.tipo;
        document.getElementById('direccion').value = datos.direccion;
        document.getElementById('ciudad').value = datos.ciudad;
        document.getElementById('departamento').value = datos.departamento;
        document.getElementById('pisos').value = datos.pisos || 1;
        document.getElementById('area').value = datos.area || '';
        document.getElementById('matricula').value = datos.matricula || '';
        document.getElementById('propietario').value = datos.propietario || '';
        document.getElementById('valor').value = datos.valor;
        document.getElementById('comercial').checked = datos.comercial;
        document.getElementById('descripcion').value = datos.descripcion || '';
        previewImg.src = datos.foto || defaultImgUrl;
        
        modal.style.display = 'flex';
    }

    function setFormInputsState(disabled) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => input.disabled = disabled);
    }

    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { 
        if (e.target === modal) modal.style.display = 'none';
        if (e.target === modalLogin) modal.style.display = 'none';
    };

    // Inicializar verificando sesión y cargando los datos de la API
    verificarEstadoSesion();
    obtenerInmueblesAPI();
});