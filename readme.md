# 🏢 CityEstate Guatemala - Plataforma de Gestión Inmobiliaria

**CityEstate Guatemala** es una aplicación Web Full-Stack desarrollada para la gestión, control, alquiler y venta de inmuebles en Guatemala. Cuenta con una arquitectura modular escalable, autenticación de usuarios basada en roles (**Usuario** / **Administrador**) y una interfaz visual moderna basada en componentes de alta interacción.

---

## 📂 Estructura del Proyecto (Cómo Funciona)

El proyecto sigue una arquitectura limpia por capas separando la infraestructura, la lógica de negocio y las vistas del cliente:

```text
📦 proyecto-inmobiliario/
 ┣ 📂 .vscode/
 ┣ 📂 node_modules/
 ┣ 📂 src/
 ┃  ┣ 📂 config/
 ┃  ┃  ┗ 📜 database.js          # Configuración de la conexión a la Base de Datos (Mongoose/MongoDB)
 ┃  ┣ 📂 controllers/
 ┃  ┃  ┣ 📜 authController.js     # Lógica de registro e inicio de sesión de usuarios
 ┃  ┃  ┗ 📜 inmuebleController.js # Lógica CRUD para la gestión de inmuebles y torres
 ┃  ┣ 📂 middleware/
 ┃  ┃  ┗ 📜 authMiddleware.js     # Validación de tokens JWT y control de privilegios (Admin/User)
 ┃  ┣ 📂 models/
 ┃  ┃  ┣ 📜 inmueble.js           # Esquema de datos de los inmuebles (MongoDB)
 ┃  ┃  ┗ 📜 user.js               # Esquema de datos de usuarios y roles
 ┃  ┗ 📂 routes/
 ┃     ┣ 📜 authRoutes.js         # Rutas de autenticación de la API
 ┃     ┗ 📜 inmuebleRoutes.js     # Rutas protegidas y públicas para inmuebles
 ┣ 📜 .env                        # Variables de entorno (Puerto, URI de BD, Secretos JWT)
 ┣ 📜 .gitignore                  # Archivos ignorados por Git
 ┣ 📜 app.js                      # Configuración central de Express y middlewares globales
 ┣ 📜 server.js                   # Punto de entrada (Entry point) para arrancar el servidor
 ┣ 📜 index.html                  # Panel principal / Dashboard de la aplicación (Frontend)
 ┣ 📜 longin.html                 # Vista de autenticación / Acceso de usuarios
 ┣ 📜 app-client.js               # Lógica del cliente para renderizar inmuebles y filtros
 ┣ 📜 login-client.js             # Lógica del cliente para el manejo de formularios de acceso
 ┣ 📜 style.css                   # Hoja de estilos principal con diseño adaptativo y animaciones
 ┣ 📜 package.json                # Dependencias y scripts de Node.js
 ┗ 📜 package-lock.json
```

---

## 🚀 Cómo se Utiliza

* **Autenticación:** El usuario ingresa a `longin.html`, donde puede iniciar sesión con sus credenciales o registrarse.
* **Dashboard Principal (`index.html`):** Al autenticarse, accede a la plataforma que muestra un contador dinámico de torres activas y el listado de inmuebles.
* **Búsqueda y Filtros:** Permite filtrar propiedades de forma instantánea por tipo (*Apartamento, Casa, Finca, Mansión, Choza, Castillo, etc.*), departamento y rango de precios en Quetzales (Q).
* **Modo Administrador:** Los usuarios con privilegios de administrador pueden añadir nuevos inmuebles (`+ Nuevo Edificio / Inmueble`), editar registros y gestionar el catálogo general mediante el modal de administración.

---

## ⚙️ Pasos para que Funcione Adecuadamente

Sigue estos pasos en tu terminal para poner en marcha el proyecto localmente:

1. **Clonar o abrir el repositorio** en tu entorno de trabajo (como Visual Studio Code).
2. **Instalar las dependencias del proyecto** ejecutando:
   ```bash
   npm install
   ```
3. **Configurar las variables de entorno:** Asegúrate de tener un archivo `.env` en la raíz con los parámetros necesarios:
   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/city_estate
   JWT_SECRET=tu_clave_secreta_aqui
   ```
4. **Iniciar el servidor:**
   * En modo desarrollo (con recarga automática):
     ```bash
     npm run dev
     ```
   * En inicio estándar:
     ```bash
     npm start
     ```
5. **Abrir en el navegador:** Entra a `http://localhost:3000/longin.html` (o la ruta estática configurada en tu servidor).

---

## 🔄 Flujo Detallado de Funcionamiento

### 1. Registro (Register)
* **Punto de partida:** El usuario accede a la vista de autenticación (`longin.html`) y selecciona la opción de registrarse.
* **Proceso técnico:** Ingresa sus datos personales y credenciales. El formulario se comunica mediante `login-client.js` con el endpoint correspondiente en `authRoutes.js`.
* **Backend:** El `authController.js` procesa la petición, encripta la contraseña y crea un nuevo registro en la base de datos utilizando el esquema `user.js` (asignando por defecto el rol estándar de usuario: `user`).

### 2. Inicio de Sesión (Login)
* **Proceso:** El usuario ingresa su correo y contraseña en la interfaz de acceso.
* **Backend:** El servidor valida las credenciales contra la base de datos. Si son correctas, genera un Token JWT (*JSON Web Token*) firmado digitalmente que contiene la identidad y el rol del usuario.
* **Cliente:** El archivo `login-client.js` almacena el token (por ejemplo, en `localStorage`) y redirige automáticamente al usuario hacia el panel principal (`index.html`).

### 3. Panel de Usuario (`index.html` - Rol User)
* **Acceso:** Una vez superado el login, el cliente carga `index.html` junto con `app-client.js`.
* **Funcionamiento:**
  * El sistema valida la sesión activa.
  * El usuario visualiza el dashboard general con el contador de torres activas y el listado de inmuebles obtenidos mediante `inmuebleRoutes.js`.
  * Puede interactuar libremente con los filtros de búsqueda (por tipo de inmueble, departamentos y precios en Quetzales) y ver los detalles de las propiedades con permisos de solo lectura.

### 4. Panel de Administrador (`index.html` - Rol Admin) y Registro de Inmuebles
* **Activación del Modo Admin:**
  * Para acceder a este modo, la cuenta debe tener el rol de administrador (`role: "admin"` en el modelo `user.js`). Esto se valida al iniciar sesión o haciendo clic en el botón **"🔑 Activar Modo Admin"** en el header.
  * El `authMiddleware.js` intercepta las peticiones de escritura y verifica que el token contenga los privilegios necesarios.
* **Interacción con el Registro de Inmuebles:**
  * Una vez activo el modo administrador, la interfaz desbloquea herramientas avanzadas, principalmente el botón **`+ Nuevo Edificio / Inmueble`**.
  * Al hacer clic, se despliega el modal donde se registran nuevas propiedades completando el formulario detallado (tipo, operación, dirección, departamento, área $____ \times ____$, niveles, contacto, valor, enganche, fotos y descripción).
  * **Backend:** Estos datos viajan a través de `inmuebleRoutes.js`, pasan por las validaciones de `authMiddleware.js`, y son procesados por `inmuebleController.js` para almacenarse de forma segura en la base de datos utilizando el modelo `inmueble.js`.

---

## 🛡️ ¿Cómo crear una cuenta Modo Administrador?

Para obtener privilegios de Administrador y poder registrar, editar o eliminar inmuebles y torres en el sistema, utiliza la clave secreta de la plataforma:

* **Mediante la Clave Secreta en el Registro:**
  * Al registrarte en la plataforma (`longin.html`), introduce la **Clave Secreta de Administrador**:
    $$\text{Clave Admin: } \mathbf{admin123}$$
  * El sistema validará la clave a través del backend y asignará automáticamente el rol de `admin` a tu perfil de usuario.