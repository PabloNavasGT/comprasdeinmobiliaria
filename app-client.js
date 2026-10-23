document.addEventListener('DOMContentLoaded', () => {

    // 🔒 PROTEGER RUTA: Si no hay token, redirigir al login de inmediato
    const tokenSeguridad = localStorage.getItem('token');
    if (!tokenSeguridad) {
        window.location.href = 'longin.html';
        return;
    }

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
    const closeLoginBtn = document.querySelector('.close-login-btn');
    const btnLogout = document.getElementById('btn-logout');
    const userDisplay = document.getElementById('user-display');
    const btnAdminToggle = document.getElementById('btn-admin-toggle');
    
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
            if (btnLogout) btnLogout.style.display = 'block';
            if (userDisplay) userDisplay.textContent = `👤 ${nombre} (${rol ? rol.toUpperCase() : 'USER'})`;

            // Si es administrador, mostrar el botón de crear inmueble y ocultar el botón de admin
            if (rol === 'admin') {
                if (btnAdminToggle) btnAdminToggle.style.display = 'none';
                if (btnNuevo) btnNuevo.style.display = 'block';
            } else {
                if (btnAdminToggle) btnAdminToggle.style.display = 'block';
                if (btnNuevo) btnNuevo.style.display = 'none'; // Usuario normal no puede crear
            }
        } else {
            if (btnLogout) btnLogout.style.display = 'none';
            if (userDisplay) userDisplay.textContent = '';
            if (btnNuevo) btnNuevo.style.display = 'none';
        }
    }

    // ACCIÓN DEL BOTÓN DIRECTO PARA ACTIVAR MODO ADMIN
    if (btnAdminToggle) {
        btnAdminToggle.onclick = async () => {
            const emailAdmin = prompt("Ingresa el correo de Administrador:");
            const passwordAdmin = prompt("Ingresa la contraseña de Administrador:");

            if (!emailAdmin || !passwordAdmin) return;

            try {
                const res = await fetch(`${AUTH_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailAdmin, password: passwordAdmin })
                });
                const data = await res.json();

                if (data.success && data.usuario.rol === 'admin') {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('rol', 'admin');
                    localStorage.setItem('nombre', data.usuario.nombre);

                    alert(`¡Modo Administrador activado con éxito, ${data.usuario.nombre}!`);
                    verificarEstadoSesion();
                    obtenerInmueblesAPI();
                } else {
                    alert('⚠️ Credenciales incorrectas o la cuenta no tiene permisos de Administrador.');
                }
            } catch (err) {
                console.error('Error al activar admin:', err);
                alert('No se pudo conectar con el servidor.');
            }
        };
    }

    // CERRAR SESIÓN (Expulsa al login de inmediato)
    if (btnLogout) {
        btnLogout.onclick = () => {
            localStorage.clear();
            alert('Sesión cerrada correctamente');
            window.location.href = 'longin.html';
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
            propertyList.innerHTML = `<p style="text-align:center; padding: 30px; color: #ef4444; font-weight: 500;"> Error de conexión con el servidor backend.</p>`;
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
// Al enviar el formulario (Crear en MongoDB)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datosInmueble = {
            tipo: document.getElementById('tipo').value,
            operacion: document.getElementById('operacion').value,
            direccion: document.getElementById('direccion').value,
            ciudad: document.getElementById('ciudad').value,
            departamento: document.getElementById('departamento').value,
            area: document.getElementById('area').value,
            pisos: Number(document.getElementById('pisos').value),
            contacto: document.getElementById('contacto').value,
            valor: Number(document.getElementById('valor').value),
            enganche: Number(document.getElementById('enganche').value) || 0,
            matricula: document.getElementById('matricula').value,
            propietario: document.getElementById('propietario').value,
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
                alert("¡Inmueble registrado con éxito en MongoDB!");
            } else {
                const errData = await response.json();
                alert(errData.message || "Error al registrar el inmueble.");
            }
        } catch (error) {
            console.error('Error al enviar los datos:', error);
        }
    });

    function rellenarFormularioSoloVer(datos) {
        modalTitle.textContent = 'Detalle del Inmueble';
        setFormInputsState(true);
        btnGuardar.style.display = 'none';
        btnFotoLabel.style.display = 'none';
        
        document.getElementById('tipo').value = datos.tipo;
        document.getElementById('operacion').value = datos.operacion || 'A la venta';
        document.getElementById('direccion').value = datos.direccion;
        document.getElementById('ciudad').value = datos.ciudad;
        document.getElementById('departamento').value = datos.departamento;
        document.getElementById('area').value = datos.area || '';
        document.getElementById('pisos').value = datos.pisos || 1;
        document.getElementById('contacto').value = datos.contacto || '';
        document.getElementById('matricula').value = datos.matricula || '';
        document.getElementById('propietario').value = datos.propietario || '';
        document.getElementById('valor').value = datos.valor;
        document.getElementById('enganche').value = datos.enganche || 0;
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

