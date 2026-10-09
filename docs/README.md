# 📖 Documentación de Raidexs Store

Bienvenido a la documentación oficial de **Raidexs Store**, una plataforma web full-stack moderna para la recarga de saldo, monedas y paquetes de juegos populares.

Este repositorio está estructurado con tecnologías de última generación para ofrecer una experiencia rápida, segura y altamente intuitiva.

---

## 📂 Contenido de la Documentación

Hemos dividido la documentación en varias secciones clave para facilitar su lectura y mantenimiento:

1. **[Arquitectura y Tecnologías](./architecture.md)**
   * Detalles sobre el stack tecnológico (React, Express, Vite, Tailwind CSS).
   * Estructura de directorios y componentes principales del cliente.
   * Configuración del servidor backend.

2. **[Base de Datos y Seguridad](./database.md)**
   * Estructura de colecciones en Firebase Firestore (`games`, `orders`, etc.).
   * Reglas de seguridad (`firestore.rules`) y roles de administrador.
   * Modelado de datos en TypeScript.

3. **[Guía de Administración](./admin_guide.md)**
   * Cómo acceder al Panel de Administración.
   * Gestión de paquetes de juego, precios y bonos.
   * Corrección de errores comunes e inicialización de datos.

---

## ⚡ Inicio Rápido para Desarrolladores

### Requisitos Previos
* Node.js v18 o superior.
* Una cuenta de Firebase configurada (Firestore y Firebase Auth).

### Instalación de Dependencias
Para comenzar, instala las dependencias necesarias:
```bash
npm install
```

### Ejecución en Desarrollo
Inicia el servidor Express y el middleware de Vite en modo de desarrollo:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### Construcción para Producción
Compila la SPA cliente y empaqueta el servidor Node en un archivo consolidado para producción:
```bash
npm run build
```
El comando anterior creará la carpeta `dist/` con todos los recursos optimizados.
