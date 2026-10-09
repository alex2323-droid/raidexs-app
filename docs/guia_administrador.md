# 👑 Guía del Administrador

El **Panel de Administración** es una sección exclusiva de la plataforma que permite gestionar de manera visual el catálogo de videojuegos, paquetes de recarga, precios, divisas y bonificaciones sin necesidad de escribir código.

---

## 🔑 Cuentas Autorizadas

Por motivos de seguridad, las operaciones de escritura en la colección `games` de Firestore están limitadas únicamente a las siguientes direcciones de correo electrónico registradas:

1. **`alexparababi23@gmail.com`**
2. **`avila2004alexparababi@gmail.com`**

Cualquier intento de modificar los paquetes de juego con otra cuenta será denegado por las reglas de seguridad de Firestore.

---

## 🖥️ Características del Panel de Administración

Al iniciar sesión con una de las cuentas autorizadas, aparecerá la opción **"Administración"** en el menú de navegación de la barra superior o lateral.

### 1. Modificar Juegos y Paquetes de Recarga
* **Precios y Cantidades:** Puedes modificar directamente el costo, la cantidad de monedas o diamantes y las bonificaciones de cada paquete individual.
* **Eliminar Paquetes:** Puedes quitar paquetes obsoletos haciendo clic en el icono de la papelera (`Trash2`).
* **Añadir Paquetes:** Puedes expandir el catálogo de ofertas de un juego presionando el botón **"Añadir Paquete"** al final de su lista.

### 2. Guardar Cambios
Una vez completadas tus ediciones, haz clic en el botón flotante **"Guardar Cambios"** (icono `Save`) en la esquina inferior derecha.

El sistema realizará los siguientes pasos técnicos en segundo plano:
1. **Validación y Limpieza:** Se limpia el objeto de estado en memoria (`JSON.parse(JSON.stringify(game))`) para remover referencias circulares o funciones de React.
2. **Operación en Lote (Batch Set):** Envía de forma masiva los documentos actualizados a Firestore garantizando atomicidad (o se guardan todos con éxito, o no se guarda ninguno).
3. **Notificación:** Una burbuja flotante confirmará la correcta persistencia de los datos con el mensaje *"Cambios guardados con éxito"*.

---

## 🛠️ Resolución de Problemas Comunes

### 1. Error de Permisos al Guardar
* **Síntoma:** Aparece el mensaje flotante *"Error al guardar. Verifica los permisos"*.
* **Causa:** Has iniciado sesión con una cuenta que no está en la lista de administradores autorizados en `firestore.rules`, o has cerrado sesión temporalmente.
* **Solución:** Cierra sesión, vuelve a ingresar con uno de los correos autorizados de la lista superior, y reintenta la operación.

### 2. Error de Red o Inicialización
Si el catálogo se encuentra vacío, la aplicación cuenta con un respaldo en memoria (contenido en `src/data.ts`) que garantiza que la interfaz de la tienda siga siendo interactiva y visualmente pulida para los usuarios finales.
