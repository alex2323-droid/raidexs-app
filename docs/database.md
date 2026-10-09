# 🗄️ Base de Datos y Reglas de Seguridad

La persistencia de datos de **NexPlay** utiliza **Google Cloud Firestore**, una base de datos de documentos NoSQL flexible y escalable en tiempo real.

---

## 🗂️ Estructura de Colecciones

### 1. Colección `games`
Almacena el catálogo de videojuegos disponibles en la plataforma, junto con sus respectivos paquetes de monedas/saldo.

* **ID del Documento:** Identificador único del juego (ej. `free-fire`, `roblox`, `clash-of-clans`).
* **Esquema del Documento:**
```typescript
{
  id: string;             // Identificador único
  name: string;           // Nombre para mostrar (ej. "Free Fire")
  publisher: string;      // Distribuidor (ej. "Garena")
  bannerUrl: string;      // URL de la imagen de fondo/cabecera
  cardUrl: string;        // URL de la imagen de tarjeta de catálogo
  currencyName: string;   // Moneda interna (ej. "Diamantes")
  category: string;       // "mobile" | "pc" | "console"
  packages: [             // Lista de paquetes disponibles
    {
      id: string;         // ID del paquete
      amount: number;     // Cantidad de monedas (ej. 100)
      currency: string;   // Moneda de pago (ej. "USD", "COP")
      price: number;      // Precio del paquete (ej. 0.99)
      bonus?: number;     // Opcional: bono adicional (ej. 10%)
      iconUrl: string;    // URL del icono del paquete
    }
  ]
}
```

---

## 🔒 Reglas de Seguridad (`firestore.rules`)

Las reglas de seguridad se aplican en el servidor de Firestore y restringen las operaciones de lectura y escritura según el estado de autenticación y el correo electrónico del usuario.

### Estructura de Reglas:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función para validar si el usuario autenticado tiene rol de Administrador
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.email == 'alexparababi23@gmail.com' ||
        request.auth.token.email == 'avila2004alexparababi@gmail.com'
      );
    }

    // Reglas para la colección 'games'
    match /games/{gameId} {
      // Cualquier usuario (autenticado o visitante) puede consultar los juegos
      allow read: if true;
      
      // Solo las cuentas de administrador especificadas pueden añadir, actualizar o borrar juegos
      allow write: if isAdmin();
    }
  }
}
```

---

## 🚀 Despliegue de Cambios en la Base de Datos

Si modificas el archivo `firestore.rules`, puedes aplicar las nuevas reglas de seguridad de inmediato. El sistema las leerá directamente en producción.

Asegúrate de mantener el formato estricto de las funciones para no bloquear el acceso de los clientes legítimos o de los administradores de la tienda.
