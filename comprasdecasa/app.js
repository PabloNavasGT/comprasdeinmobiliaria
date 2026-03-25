document.addEventListener('DOMContentLoaded', () => {
    
    const modal = document.getElementById('modal-inmueble');
    const btnNuevo = document.getElementById('btn-nuevo');
    const closeBtn = document.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('inmueble-form');
    const btnGuardar = document.getElementById('btn-guardar');
    const propertyList = document.getElementById('property-list');
    const paginationContainer = document.querySelector('.pagination');
    
    const fotoUpload = document.getElementById('foto-upload');
    const previewImg = document.getElementById('preview-img');
    const btnFotoLabel = document.querySelector('.btn-foto'); 
    
   
    let listaInmuebles = []; 
    let paginaActual = 1;
    const itemsPorPagina = 3;
    
    const defaultImgUrl = "https://via.placeholder.com/300x300?text=Sin+Foto";
    let imagenActualBase64 = "https://via.placeholder.com/150x100?text=Sin+Foto"; 

    
    function renderizarPropiedades() {
        propertyList.innerHTML = ''; 

        const inicio = (paginaActual - 1) * itemsPorPagina;
        const fin = inicio + itemsPorPagina;
        const inmueblesVisibles = listaInmuebles.slice(inicio, fin);

        inmueblesVisibles.forEach((inmueble, index) => {
            const nuevaFila = document.createElement('div');
            nuevaFila.className = 'property-item';
            
            nuevaFila.innerHTML = `
                <img src="${inmueble.foto}" alt="${inmueble.tipo}">
                <span class="prop-type">${inmueble.tipo}</span>
                <span class="prop-address">${inmueble.direccion}</span>
                <span class="prop-price">${inmueble.valor}</span>
                <div class="prop-actions">
                    <a href="#" class="btn-ver">Ver</a>
                    <a href="#" class="btn-eliminar">Eliminar</a>
                </div>
            `;

            
            nuevaFila.querySelector('.btn-eliminar').onclick = (ev) => {
                ev.preventDefault();
                if(confirm('¿Borrar este inmueble?')) {
                    
                    const indiceReal = inicio + index;
                    listaInmuebles.splice(indiceReal, 1);
                   
                    if (listaInmuebles.slice(inicio, fin).length === 0 && paginaActual > 1) {
                        paginaActual--;
                    }
                    renderizarTodo();
                }
            };

            nuevaFila.querySelector('.btn-ver').onclick = (ev) => {
                ev.preventDefault();
                rellenarFormularioSoloVer(inmueble);
            };

            propertyList.appendChild(nuevaFila);
        });
        
        actualizarPaginacionUI();
    }

    function actualizarPaginacionUI() {
        const totalPaginas = Math.ceil(listaInmuebles.length / itemsPorPagina) || 1;
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
        modalTitle.textContent = 'Nuevo Inmueble';
        form.reset(); 
        setFormInputsState(false);
        btnGuardar.style.display = 'block';
        btnFotoLabel.style.display = 'inline-block';
        previewImg.src = defaultImgUrl;
        imagenActualBase64 = "https://via.placeholder.com/150x100?text=Sin+Foto";
        modal.style.display = 'flex';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const datosInmueble = {
            direccion: document.getElementById('direccion').value,
            tipo: document.getElementById('tipo').value,
            ciudad: document.getElementById('ciudad').value,
            departamento: document.getElementById('departamento').value,
            matricula: document.getElementById('matricula').value,
            area: document.getElementById('area').value,
            propietario: document.getElementById('propietario').value,
            identificacion: document.getElementById('identificacion').value,
            valor: document.getElementById('valor').value,
            comercial: document.getElementById('comercial').checked,
            foto: imagenActualBase64
        };

        listaInmuebles.push(datosInmueble);
        
        modal.style.display = 'none';
        renderizarTodo();
        alert("¡Inmueble creado!");
    });

    function rellenarFormularioSoloVer(datos) {
        modalTitle.textContent = 'Detalle del Inmueble';
        setFormInputsState(true);
        btnGuardar.style.display = 'none';
        btnFotoLabel.style.display = 'none';
        
        document.getElementById('direccion').value = datos.direccion;
        document.getElementById('tipo').value = datos.tipo;
        document.getElementById('ciudad').value = datos.ciudad;
        document.getElementById('departamento').value = datos.departamento;
        document.getElementById('matricula').value = datos.matricula;
        document.getElementById('area').value = datos.area;
        document.getElementById('propietario').value = datos.propietario;
        document.getElementById('identificacion').value = datos.identificacion;
        document.getElementById('valor').value = datos.valor;
        document.getElementById('comercial').checked = datos.comercial;
        previewImg.src = datos.foto;
        modal.style.display = 'flex';
    }

    function setFormInputsState(disabled) {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => input.disabled = disabled);
    }

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
});