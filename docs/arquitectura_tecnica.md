# 🏛️ Arquitectura del Sistema

**E Gaming Store** está diseñada como una aplicación full-stack de alto rendimiento, optimizada para ofrecer una navegación fluida, diseño moderno y persistencia en la nube.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Biblioteca de interfaces rápida y compilación instantánea sin HMR en preview. |
| **Estilos** | Tailwind CSS v4 | Estructura de diseño modular utilizando clases de utilidad modernas. |
| **Backend** | Express.js, Node.ts | Servidor proxy de API y servidor de archivos estáticos para producción. |
| **Base de Datos** | Firebase Firestore | Base de datos NoSQL en la nube con actualización en tiempo real. |
| **Autenticación** | Firebase Auth | Autenticación segura de usuarios (correo electrónico y contraseña). |

---

## 📂 Estructura de Directorios

La estructura de carpetas del proyecto se divide principalmente en el cliente React (`src/`) y el servidor Express (`server.ts`):

```text
├── docs/                       # Documentación técnica
├── src/                        # Código del cliente (Frontend)
│   ├── components/             # Componentes modulares de React
│   │   ├── AdminPanel.tsx      # Panel para editar juegos y paquetes
│   │   ├── Login.tsx           # Formulario de inicio de sesión con Firebase Auth
│   │   ├── GameRecharge.tsx    # Vista para seleccionar paquetes de un juego
│   │   ├── OrdersHistory.tsx   # Historial de compras del usuario
│   │   ├── Header.tsx / Footer.tsx # Elementos comunes de la interfaz
│   │   └── ...                 # Otros componentes secundarios
│   ├── App.tsx                 # Enrutamiento principal y manejo de estados globales
│   ├── data.ts                 # Datos semilla e iniciales para los juegos
│   ├── firebase.ts             # Inicialización y servicios del SDK de Firebase
│   ├── types.ts                # Definiciones de tipos e interfaces de TypeScript
│   └── index.css               # Estilos globales y temas de Tailwind CSS
├── server.ts                   # Servidor Express (Backend)
├── package.json                # Configuración de dependencias y scripts de ejecución
└── firestore.rules             # Reglas de seguridad de base de datos
```

---

## 📡 Servidor Backend (`server.ts`)

El backend corre sobre **Express** y tiene dos funciones principales:

1. **Entorno de Desarrollo (`development`):**
   Actúa como un wrapper integrando el middleware de **Vite** en modo `middlewareMode: true`. Esto permite servir los recursos TypeScript directamente con compilación rápida al vuelo sin exponer puertos adicionales.

2. **Entorno de Producción (`production`):**
   Sirve los archivos estáticos compilados que se encuentran en la carpeta `/dist`. Resuelve las peticiones SPA enviando todas las rutas al archivo `index.html`.

### Código de Inicialización del Servidor:
* El servidor está configurado para escuchar en la dirección `0.0.0.0` y en el puerto `3000`. Esto es un requisito obligatorio del entorno de contenedores Cloud Run para garantizar la correcta recepción de tráfico.

---

## 🧭 Flujo de Navegación del Cliente

El enrutamiento y la renderización condicional se controlan de forma centralizada en `src/App.tsx`:

1. **Estado de Autenticación:**
   Se utiliza el observer `onAuthStateChanged` de Firebase. Si el usuario no ha iniciado sesión, se le muestra la pantalla de **Login**.
2. **Sesión Expirada:**
   Se valida la última fecha de inicio de sesión guardada localmente de manera segura. Si excede las 24 horas, la sesión se expira automáticamente por seguridad y se redirige al Login.
3. **Navegación Condicional:**
   Se renderiza el header y el menú lateral móvil (`MobileNav`) para navegar entre las secciones de la tienda:
   * **Inicio (`Home`):** Catálogo de juegos disponibles para recarga.
   * **Recarga de Juego (`GameRecharge`):** Selección de ID de jugador, paquete, método de pago y confirmación de orden.
   * **Historial de Órdenes (`OrdersHistory`):** Visualización de las compras del usuario actual.
   * **Panel de Administración (`AdminPanel`):** Exclusivo para administradores, permite añadir y editar paquetes de juegos en tiempo real.
