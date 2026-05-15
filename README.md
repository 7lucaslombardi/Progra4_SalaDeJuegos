# 🕹️ Trabajo Práctico: Sala de Juegos

**Programación IV - UTN FRA**

Proyecto web interactivo desarrollado con Angular, que integra un sistema de autenticación de usuarios y una colección de mini-juegos (en desarrollo), todo bajo una estética visual "Neubrutalista".

👤 **Desarrollador:** Lucas Lombardi  
🔗 **Deploy (Vercel):** [Acceder a la Sala de Juegos](https://progra4-sala-de-juegos-git-main-7lucaslombardis-projects.vercel.app/)

---

## 🛠️ Stack Tecnológico

Para el desarrollo de esta aplicación se seleccionaron las siguientes tecnologías y herramientas:

* **Frontend:** Angular 18 (Arquitectura Standalone).
* **Backend & Auth:** Supabase (Base de datos y gestión de usuarios).
* **Manejo de Estado & Formularios:** Angular Signals + Reactive Forms (`ReactiveFormsModule`).
* **Estilos:** CSS Puro orientado a diseño UI Neubrutalista (alto contraste, sombras rígidas).
* **Despliegue:** Vercel (Integración continua desde GitHub).

---

## 🚀 Progreso del Proyecto

### ✅ Sprint 1: Fundamentos y Navegación
**Estado:** Finalizado | **Tag:** `v1.0`
🔗 **Deploy (Vercel):** (https://progra4-sala-de-juegos-git-main-7lucaslombardis-projects.vercel.app/)

En esta etapa se construyó la base estructural de la aplicación, asegurando un enrutamiento fluido y el despliegue inicial en la nube.

* **Arquitectura:** Creación de los componentes base (`Home`/`Bienvenida`, `Login`, `Registro`, `QuienSoy`).
* **Ruteo:** Configuración inicial de `app.routes.ts` permitiendo la navegación libre entre las pantallas.
* **Integración API:** La sección "Quién Soy" consume la API pública de GitHub para obtener y renderizar dinámicamente mi información de perfil y avatar.
* **Diseño:** Configuración del Favicon del sitio y maquetación inicial de las vistas.

---

### ✅ Sprint 2: Seguridad y Manejo de Usuarios
**Estado:** Finalizado | **Tag:** `v2.0.0`
🔗 **Deploy (Vercel):** [Acceder a la Sala de Juegos](https://progra4-sala-de-juegos-git-sprint2-7lucaslombardis-projects.vercel.app/)

Implementación de la capa de seguridad, gestión de sesiones y control de acceso a las rutas dependiendo del estado del jugador.

**1. Gestión de Sesión (Header Dinámico)**
* La barra de navegación reacciona en tiempo real usando Signals.
* **Usuario Anónimo:** Solo visualiza los accesos a Login y Registro.
* **Usuario Logueado:** Visualiza su nombre, la sección "Quién Soy" y el botón para cerrar sesión.

**2. Sistema de Registro**
* Formulario Reactivo validado en tiempo real (requiere nombre, apellido, edad válida, formato de email correcto y contraseña segura).
* Creación del usuario en la base de datos de Supabase.
* Inicio de sesión automático y redirección fluida tras un registro exitoso.

**3. Autenticación (Login) y Accesibilidad**
* Validación de credenciales contra Supabase.
* Manejo de errores amigable para el usuario (credenciales inválidas, campos incompletos).
* Incorporación de **Accesos Rápidos**: 3 botones de testeo que autocompletan el formulario con usuarios preexistentes para agilizar la evaluación del docente.

**4. Protección de Rutas (Guards)**
* Implementación de `authGuard` de Angular para restringir el acceso. Si un usuario no autenticado intenta acceder a una ruta protegida (como los juegos), es redirigido automáticamente al Login.