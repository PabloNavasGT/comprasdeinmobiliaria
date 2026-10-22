document.addEventListener('DOMContentLoaded', () => {
    const sectionLogin = document.getElementById('section-login');
    const sectionRegister = document.getElementById('section-register');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    const AUTH_URL = 'http://localhost:4000/api/auth';

    // 1. Alternar a la vista de Registro
    if (showRegister) {
        showRegister.onclick = (e) => {
            e.preventDefault();
            sectionLogin.style.display = 'none';
            sectionRegister.style.display = 'block';
        };
    }

    // 2. Alternar de regreso a la vista de Login
    if (showLogin) {
        showLogin.onclick = (e) => {
            e.preventDefault();
            sectionRegister.style.display = 'none';
            sectionLogin.style.display = 'block';
        };
    }

    // 3. Petición de Registro (Guarda en MongoDB y devuelve al Login)
    if (formRegister) {
        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('reg-nombre').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            try {
                const res = await fetch(`${AUTH_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, email, password, rol: 'user' })
                });
                const data = await res.json();

                if (data.success) {
                    alert('¡Cuenta registrada con éxito en MongoDB! Ahora puedes iniciar sesión.');
                    formRegister.reset();
                    sectionRegister.style.display = 'none';
                    sectionLogin.style.display = 'block';
                } else {
                    alert(data.message || 'Error al registrarse');
                }
            } catch (error) {
                console.error('Error en registro:', error);
                alert('No se pudo conectar con el servidor.');
            }
        });
    }

    // 4. Petición de Login (Autentica y lleva al index.html)
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
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

                    alert(`¡Bienvenido, ${data.usuario.nombre}!`);
                    window.location.href = 'index.html';
                } else {
                    alert(data.message || 'Credenciales inválidas');
                }
            } catch (error) {
                console.error('Error en login:', error);
                alert('No se pudo conectar con el servidor de autenticación.');
            }
        });
    }
});