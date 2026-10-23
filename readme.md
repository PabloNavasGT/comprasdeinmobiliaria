CityEstate Guatemala
Aplicación Web Full-Stack desarrollada para la gestión, control, alquiler y venta de inmuebles en Guatemala. Cuenta con una arquitectura modular escalable, autenticación de usuarios por roles (Usuario / Administrador) y una interfaz visual moderna basada en componentes de alta interacción.

📂 Estructura del Proyecto (Cómo Funciona)
El proyecto sigue una arquitectura limpia por capas separando la infraestructura, la lógica de negocio y las vistas del cliente:

Plaintext
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
🚀 Cómo se Utiliza
Autenticación: El usuario ingresa a longin.html, donde puede iniciar sesión con sus credenciales o registrarse.

Dashboard Principal (index.html): Al autenticarse, accede a la plataforma que muestra un contador dinámico de torres activas y el listado de inmuebles.

Búsqueda y Filtros: Permite filtrar propiedades de forma instantánea por tipo (Apartamento, Casa, Finca, Mansión, etc.) y por rango de precios en Quetzales (Q).

Modo Administrador: Los usuarios con privilegios de administrador pueden añadir nuevos inmuebles (+ Nuevo Edificio / Inmueble), editar registros y gestionar el catálogo general mediante el modal de administración.

⚙️ Pasos para que Funcione Adecuadamente
Sigue estos pasos en tu terminal para poner en marcha el proyecto localmente:

Clonar o abrir el repositorio en tu entorno de trabajo (como Visual Studio Code).

Instalar las dependencias del proyecto ejecutando:

Bash
npm install
Configurar las variables de entorno: Asegúrate de tener un archivo .env en la raíz con los parámetros necesarios (por ejemplo, PORT=3000 y la cadena de conexión MONGO_URI).

Iniciar el servidor en modo desarrollo (con recarga automática):

Bash
npm run dev
O bien, mediante el inicio estándar:

Bash
npm start
Abrir en el navegador: Entra a http://localhost:3000/longin.html (o la ruta estática configurada en tu servidor).

1. Registro (Register)
Punto de partida: El usuario accede a la vista de autenticación (longin.html) y selecciona la opción de registrarse.

Proceso técnico: Ingresa sus datos personales y credenciales. El formulario se comunica mediante login-client.js con el endpoint correspondiente en authRoutes.js.

Backend: El authController.js procesa la petición, encripta la contraseña y crea un nuevo registro en la base de datos utilizando el esquema user.js (asignando por defecto un rol estándar de usuario: user).

2. Inicio de Sesión (Login)
Proceso: El usuario ingresa su correo y contraseña en la interfaz de acceso.

Backend: El servidor valida las credenciales contra la base de datos. Si son correctas, genera un Token JWT (JSON Web Token) firmado digitalmente que contiene la identidad y el rol del usuario.

Cliente: El archivo login-client.js almacena el token (por ejemplo, en localStorage) y redirige automáticamente al usuario hacia el panel principal (index.html).

3. Panel de Usuario (Index User)
Acceso: Una vez superado el login, el cliente carga index.html junto con app-client.js.

Funcionamiento:

El sistema valida la sesión activa.

El usuario visualiza el dashboard general con el contador de torres activas y el listado de inmuebles obtenidos mediante inmuebleRoutes.js.

Puede interactuar libremente con los filtros de búsqueda (por tipo de inmueble: Apartamento, Casa, Finca, etc. y por rangos de precio en Quetzales) y ver los detalles de las propiedades, pero con permisos de solo lectura (restringiendo acciones de modificación).

4. Panel de Administrador (Index Admin) y su Interacción con el Registro
Activación del Modo Admin:

Para acceder a este modo, la cuenta debe tener el rol de administrador (role: "admin" en el modelo user.js). Esto se puede configurar directamente en la base de datos o validarse al hacer clic en el botón "🔑 Activar Modo Admin" en el header.

El authMiddleware.js intercepta las peticiones y verifica que el token contenga los privilegios necesarios.

Interacción con el Registro de Inmuebles:

Una vez activo el modo administrador, la interfaz desbloquea herramientas avanzadas, principalmente el botón + Nuevo Edificio / Inmueble.

Al hacer clic, se despliega el modal de administración donde el administrador puede registrar nuevas propiedades completando el formulario detallado (tipo, operación, dirección, departamento, área, niveles, valor, enganche, fotos y descripción).

Backend: Estos datos viajan a través de inmuebleRoutes.js, pasan por las validaciones del authMiddleware.js, y son procesados por el inmuebleController.js para almacenarse de forma segura en la colección de la base de datos utilizando el modelo inmueble.js.

🛡️ ¿Cómo crear una cuenta Modo Administrador?
Para obtener privilegios de Administrador y poder registrar, editar o eliminar inmuebles y torres en el sistema, tienes dos métodos seguros:

Mediante la Clave Secreta en el Registro 
Al registrarte en la plataforma (longin.html), introduce el parámetro de rol o la Clave Secreta de Administrador la cual es(admin123)

El sistema validará la clave a través del backend y asignará automáticamente el rol de admin a tu perfil de usuario.