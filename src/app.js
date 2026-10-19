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
    
    let listaInmuebles = JSON.parse(localStorage.getItem('inmuebles')) || [];
    let paginaActual = 1;
    const itemsPorPagina = 3;
    
    const defaultImgUrl = "https://via.placeholder.com/300x300?text=Sin+Fachada";
    let imagenActualBase64 = defaultImgUrl; 

    function persistirDatos() {
        localStorage.setItem('inmuebles', JSON.stringify(listaInmuebles));
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

        if (inmueblesVisibles.length === 0) {
            propertyList.innerHTML = `<p style="text-align:center; padding: 30px; color: #64748b; font-weight: 500;"> No se encontraron torres o inmuebles con los filtros seleccionados.</p>`;
            paginationContainer.innerHTML = '';
            return;
        }

        inmueblesVisibles.forEach((inmueble) => {
            const indiceReal = listaInmuebles.findIndex(el => el === inmueble);

            const nuevaFila = document.createElement('div');
            nuevaFila.className = 'property-item';
            
            nuevaFila.innerHTML = `
                <img src="${inmueble.foto}" alt="${inmueble.tipo}">
                <div class="prop-type">
                    <strong> ${inmueble.tipo}</strong><br>
                    <small style="color:#64748b;">Niveles: ${inmueble.pisos}</small>
                </div>
                <span class="prop-address"> ${inmueble.direccion}, ${inmueble.ciudad}</span>
                <span class="prop-price"><strong>Q ${Number(inmueble.valor).toLocaleString()}</strong></span>
                <div class="prop-actions">
                    <a href="#" class="btn-ver">Ver</a>
                    <a href="#" class="btn-eliminar" style="color: #ef4444;">Eliminar</a>
                </div>
            `;

            nuevaFila.querySelector('.btn-eliminar').onclick = (ev) => {
                ev.preventDefault();
                if(confirm('¿Deseas demoler / eliminar este registro?')) {
                    listaInmuebles.splice(indiceReal, 1);
                    persistirDatos();
                    
                    const totalPaginas = Math.ceil(obtenerInmueblesFiltrados().length / itemsPorPagina) || 1;
                    if (paginaActual > totalPaginas) paginaActual = totalPaginas;

                    renderizarTodo();
                }
            };

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

    btnNuevo.addEventListener('click', () => {
        modalTitle.textContent = 'Nuevo Inmueble Urbano';
        form.reset(); 
        setFormInputsState(false);
        btnGuardar.style.display = 'block';
        btnFotoLabel.style.display = 'inline-block';
        previewImg.src = defaultImgUrl;
        imagenActualBase64 = defaultImgUrl;
        modal.style.display = 'flex';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const datosInmueble = {
            tipo: document.getElementById('tipo').value,
            direccion: document.getElementById('direccion').value,
            ciudad: document.getElementById('ciudad').value,
            departamento: document.getElementById('departamento').value,
            pisos: document.getElementById('pisos').value,
            area: document.getElementById('area').value,
            matricula: document.getElementById('matricula').value,
            propietario: document.getElementById('propietario').value,
            valor: document.getElementById('valor').value,
            comercial: document.getElementById('comercial').checked,
            descripcion: document.getElementById('descripcion').value,
            foto: imagenActualBase64
        };

        listaInmuebles.push(datosInmueble);
        persistirDatos();
        
        modal.style.display = 'none';
        renderizarTodo();
        alert("¡Torre / Inmueble registrado con éxito en la ciudad!");
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
        document.getElementById('area').value = datos.area;
        document.getElementById('matricula').value = datos.matricula;
        document.getElementById('propietario').value = datos.propietario;
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

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    renderizarTodo();
});