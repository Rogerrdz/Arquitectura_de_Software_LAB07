## Laboratorio #7 – REST API Blueprints + Frontend React (Java 21 / Spring Boot 3.3.x)
# Escuela Colombiana de Ingeniería – Arquitecturas de Software  

**Repositorio:** https://github.com/Rogerrdz/Arquitectura_de_Software_LAB07

---

## Requisitos

### Backend
- Java 21
- Maven 3.9+

### Frontend
- Node.js 18+
- npm 9+

## Ejecución del proyecto

### Backend (Spring Boot REST API + WebSocket/STOMP)

Desde la carpeta raíz del repositorio:

```bash
cd BluePrints
mvn clean install
mvn spring-boot:run
```

El backend se ejecuta en **http://localhost:8082** con los siguientes endpoints:

**CRUD REST:**
```bash
# Listar blueprints (con total de puntos por autor)
curl -s http://localhost:8082/api/blueprints | jq

# Listar por autor
curl -s http://localhost:8082/api/blueprints/john | jq

# Obtener blueprint específico
curl -s http://localhost:8082/api/blueprints/john/house | jq

# Crear blueprint
curl -i -X POST http://localhost:8082/api/blueprints \
  -H 'Content-Type: application/json' \
  -d '{ "author":"john", "name":"kitchen", "points":[{"x":1,"y":1},{"x":2,"y":2}] }'

# Actualizar blueprint (agregar puntos)
curl -i -X PUT http://localhost:8082/api/blueprints/john/kitchen/points \
  -H 'Content-Type: application/json' \
  -d '{ "x":3, "y":3 }'

# Eliminar blueprint
curl -i -X DELETE http://localhost:8082/api/blueprints/john/kitchen
```

**Autenticación JWT:**
```bash
# Login (obtener token)
curl -i -X POST http://localhost:8082/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{ "user":"user", "password":"password123" }'

# Usar token en peticiones protegidas
curl -i -X GET http://localhost:8082/api/blueprints \
  -H 'Authorization: Bearer <JWT_TOKEN>'
```

**WebSocket STOMP** (descrito abajo):
- Endpoint: `/ws-blueprints`
- Publicar punto: `/app/draw`
- Suscribirse: `/topic/blueprints.{author}.{name}`

---

Documentación interactiva:
- Swagger UI: [http://localhost:8082/swagger-ui.html](http://localhost:8082/swagger-ui.html)
- OpenAPI JSON: [http://localhost:8082/v3/api-docs](http://localhost:8082/v3/api-docs)

---

### Frontend (React + Vite)

Desde la carpeta raíz del repositorio:

```bash
cd React_Client
npm install
npm run dev
```

El frontend se ejecuta en **http://localhost:5173** (o **http://[::1]:5173** en IPv6).

**Configuración (.env.local):**
```env
VITE_API_BASE=http://localhost:8082
VITE_STOMP_BASE=ws://localhost:8082
```

**Credenciales de prueba:**
- Usuario: `user`
- Contraseña: `password123`  

---

## Tiempo Real - Colaboración con STOMP

Este backend implementa colaboración en vivo mediante **Spring WebSocket con STOMP**, permitiendo que múltiples clientes trabajen simultáneamente en el mismo blueprint.

### Conexión y Flujo

1. **Conectar al WebSocket:**
   ```javascript
   const client = new StompClient({
     brokerURL: 'ws://localhost:8082/ws-blueprints',
     connectHeaders: { Authorization: `Bearer ${token}` },
     onConnect: () => { /* subscribirse a tópicos */ }
   })
   client.activate()
   ```

2. **Publicar un punto dibujado:**
   ```javascript
   client.publish({
     destination: '/app/draw',
     body: JSON.stringify({
       author: 'john',
       name: 'house',
       point: { x: 120, y: 80 }
     })
   })
   ```

3. **Suscribirse a cambios en un blueprint:**
   ```javascript
   client.subscribe(
     '/topic/blueprints.john.house',
     (message) => {
       const blueprint = JSON.parse(message.body)
       // Actualizar canvas con nuevos puntos
     }
   )
   ```

### Endpoints STOMP

- **WebSocket:** `ws://localhost:8082/ws-blueprints`
- **Entrada:** `POST /app/draw` (recibe punto)
- **Salida:** `SUBSCRIBE /topic/blueprints.{author}.{name}` (broadcast de actualización)

### Payload Esperado

```json
{
  "author": "john",
  "name": "house",
  "point": { "x": 120, "y": 80 }
}
```

El servidor persiste el punto en memoria, notifica a todos los clientes suscritos al tópico del blueprint.

### Aislamiento por Blueprint

Cada blueprint tiene su propio tópico (`blueprints.{author}.{name}`), asegurando que:
- Múltiples blueprints pueden editarse simultáneamente sin interferencia.
- Solo los clientes suscritos al tópico reciben las actualizaciones.

---

## Frontend - React + Vite (Interfaz en Español)

### Características Principales

- **Interfaz completamente en español:** Etiquetas, mensajes y validaciones localizadas.
- **Autenticación JWT:** Login con usuario/contraseña antes de acceder a blueprints.
- **CRUD completo:** Crear, consultar, actualizar y eliminar blueprints.
- **Canvas interactivo:** Dibuja haciendo clic en el lienzo; los puntos se persisten en tiempo real.
- **Colaboración en vivo:** Abre dos pestañas del mismo blueprint; verás cómo los puntos se sincronizan entre pestañas vía STOMP.
- **Redux Toolkit:** Gestión de estado centralizada para auth y blueprints.
- **Vitest:** Suite de tests unitarios para componentes y slices.

### Estructura de Componentes

```
React_Client/src/
  ├── App.jsx                         # Router principal
  ├── main.jsx                        # Entry point
  ├── styles.css                      # Estilos globales
  ├── components/
  │   ├── BlueprintCanvas.jsx         # Canvas para dibujar (lectura)
  │   ├── BlueprintForm.jsx           # Formulario crear/editar
  │   ├── BlueprintList.jsx           # Tabla de blueprints por autor
  │   ├── InteractiveBlueprintCanvas.jsx  # Canvas interactivo + STOMP
  │   └── PrivateRoute.jsx            # Protección de rutas autenticadas
  ├── features/
  │   ├── auth/                       # Redux slice para autenticación
  │   └── blueprints/                 # Redux slice para blueprints
  ├── pages/
  │   ├── LoginPage.jsx               # Página de login
  │   ├── BlueprintsPage.jsx          # Página principal de blueprints
  │   ├── BlueprintDetailPage.jsx     # Detalle + edición
  │   └── NotFound.jsx                # 404
  ├── services/
  │   ├── apiClient.js                # Cliente HTTP (axios)
  │   ├── blueprintsService.js        # Llamadas a API rest
  │   └── apimock.js                  # Mock para desarrollo
  ├── store/
  │   └── index.js                    # Configuración Redux
  └── tests/
      ├── BlueprintCanvas.test.jsx
      ├── BlueprintForm.test.jsx
      ├── BlueprintsPage.test.jsx
      ├── blueprintsSlice.test.jsx
      └── setup.js
```

### Tecnologías

- **React 18.2** - UI components
- **Redux Toolkit 2.2** - State management
- **@stomp/stompjs 7.2** - WebSocket/STOMP client
- **axios** - HTTP client
- **React Router 6.22** - Client-side routing
- **Vite** - Build tool
- **Vitest** - Unit testing

---

## Seguridad

### Autenticación JWT

1. **Login:** Envía usuario/contraseña a `POST /api/auth/login`.
2. **Response:** Backend retorna JWT token.
3. **Almacenamiento:** Token guardado en Redux store (y localStorage para persistencia).
4. **Headers:** Todo request incluye `Authorization: Bearer <token>`.
5. **Protección:** Rutas protegidas no accesibles sin token válido.

### CORS Configurado

El backend acepta orígenes de:
- `http://localhost:*` (IPv4)
- `http://127.0.0.1:*` (IPv4 loopback)
- `http://[::1]:*` (IPv6)

Esto permite el desarrollo tanto desde `localhost` como desde `[::1]` con cualquier puerto Vite.

**Credenciales por defecto (dev):**
- Usuario: `user`
- Contraseña: `password123`

## Estructura de Carpetas

### Backend (Spring Boot)

```
BluePrints
  ├── pom.xml                        # Maven configuration
  ├── Dockerfile                     # Image para containerizar
  ├── docker-compose.yml             # Orquestación (opcional: PostgreSQL)
  ├── src/
  │   ├── main/
  │   │   ├── java/edu/eci/arsw/blueprints/
  │   │   │   ├── model/             # Entidades: Blueprint, Point
  │   │   │   ├── persistence/       # Interfaz BlueprintPersistence
  │   │   │   │   └── impl/          # Implementaciones (InMemory, Postgres)
  │   │   │   ├── services/          # BlueprintsService (lógica)
  │   │   │   ├── filters/           # Filtros (Identity, Redundancy, etc.)
  │   │   │   ├── controllers/       # REST Controllers + WebSocket handlers
  │   │   │   ├── config/            # Security, WebSocket, Swagger/OpenAPI
  │   │   │   ├── security/          # JWT, JwtAuthenticationFilter
  │   │   │   └── BlueprintsApplication.java
  │   │   └── resources/
  │   │       ├── application.yml    # Configuración principal
  │   │       ├── application-prod.yml
  │   │       └── data.sql           # Datos iniciales
  │   └── test/
  │       ├── java/
  │       └── resources/
  └── target/                        # Compilados y jar final
```

### Frontend (React)

```
React_Client/
  ├── src/
  │   ├── components/               # Componentes reutilizables
  │   ├── features/                 # Redux slices (auth, blueprints)
  │   ├── pages/                    # Páginas de la app
  │   ├── services/                 # Llamadas API y WebSocket
  │   ├── store/                    # Redux store
  │   ├── tests/                    # Tests unitarios
  │   └── App.jsx                   # Componente raíz
  ├── vite.config.js                # Configuración Vite
  ├── vitest.config.js              # Configuración Vitest
  ├── .env.local                    # Variables de entorno
  └── package.json
```

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend React (Puerto 5173)                                │
│ ├─ Redux store (auth + blueprints state)                    │
│ ├─ HTTP Client (axios) ──────────┐                          │
│ └─ STOMP Client ──────────────────┼──────────────────────┐  │
└─────────────────────────────────┼──────────────────────┼──┘
                                 │                      │
                    ┌────────────┘                      │
                    │ REST API                          │ WebSocket/STOMP
                    │                                   │
                    ▼                                   ▼
        ┌──────────────────────────────────────────────────────┐
        │ Backend Spring Boot 3.3.x (Puerto 8082)              │
        │ ├─ SecurityConfig (JWT, CORS)                        │
        │ ├─ RestController (/api/blueprints/...)              │
        │ ├─ WebSocketConfig + STOMP Message Handler           │
        │ ├─ BlueprintsService (orquestación)                  │
        │ └─ BlueprintPersistence (in-memory o DB)             │
        └──────────────────────────────────────────────────────┘
```

---

## Actividades del Laboratorio (Parte 3)

### 1. Familiarización con el código base
- Revisa el paquete `model` con las clases `Blueprint` y `Point`.
- Entiende la capa `persistence` con `BlueprintPersistence` e `InMemoryBlueprintPersistence`.
- Analiza la capa `services` (`BlueprintsService`) y el controlador REST.
- Revisa la configuración de `SecurityConfig` (JWT y CORS) y `WebSocketConfig` (STOMP).

### 2. Autenticación con JWT
- Login endpoint: `POST /api/auth/login` (usuario/contraseña).
- Token retornado y almacenado en el cliente.
- Todos los endpoints REST protegidos con `@PreAuthorize`.
- WebSocket requiere token en headers de conexión.

### 3. Configuración CORS para desarrollo
- Aceptar orígenes: `http://localhost:*`, `http://127.0.0.1:*`, `http://[::1]:*`.
- Permitir credenciales en peticiones CORS.
- Configurado en `SecurityConfig` y `WebSocketConfig`.

### 4. WebSocket e integración STOMP
- Endpoint: `/ws-blueprints`.
- Message handler en `/app/draw` recibe puntos.
- Broadcast a `/topic/blueprints.{author}.{name}`.
- Manejo de desconexiones y reconexiones en el cliente.

### 5. Frontend React + Redux
- Estructura con Redux Toolkit para estado global (auth + blueprints).
- Componentes funcionales con hooks.
- STOMP client integrado en `features/blueprints` para sincronización.
- UI completamente en español.
- Suite de tests (Vitest) con cobertura de componentes críticos.

### 6. Migración a PostgreSQL (Opcional)
- Cambia `application.yml` y añade dependencia de PostgreSQL.
- Implementa `PostgresBlueprintPersistence` si aplica.
- Usa `@Primary` para activar la nueva implementación.

### 7. Docker (Opcional)
- `Dockerfile` para compilar imagen del backend.
- `docker-compose.yml` con servicio PostgreSQL (si usas).
- Ejecutar con: `docker-compose up --build`.

---

## Entregables

1. **Repositorio en GitHub** (https://github.com/Rogerrdz/Arquitectura_de_Software_LAB07.git) con:
   - Backend Spring Boot 3.3.x con REST API + WebSocket/STOMP.
   - Frontend React + Vite con autenticación JWT.
   - CORS configurado para IPv4, IPv6 y localhost.
   - UI completamente en español.
   - Documentación Swagger/OpenAPI habilitada.

2. **Funcionamiento integrado:**
   - Login exitoso desde frontend (user/password123).
   - CRUD de blueprints (crear, listar, editar, eliminar).
   - Colaboración en tiempo real con STOMP (2 pestañas sincronizadas).
   - Tests pasando (4/4 en frontend).

3. **Documentación:**
   - README con instrucciones de setup (backend + frontend).
   - Variables de entorno documentadas.
   - Endpoints REST y STOMP documentados.
   - Credenciales de prueba proporcionadas.

---

## Criterios de Evaluación

| Criterio | Peso | Estado |
|----------|------|--------|
| Diseño de API REST (versionamiento, JWT, códigos HTTP) | 20% | Completo |
| Autenticación y CORS | 15% | Completo |
| WebSocket/STOMP colaborativo | 20% | Completo |
| Frontend React integrado + UI en español | 25% | Completo |
| Documentación + Tests | 20% | Completo |

---

## Pruebas Manuales

### Caso 1: Autenticación
```bash
# Login
curl -i -X POST http://localhost:8082/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{ "user":"user", "password":"password123" }'

# Copiar el token retornado y usarlo en próximas peticiones
```

### Caso 2: CRUD Básico
```bash
# 1. Crear blueprint
curl -i -X POST http://localhost:8082/api/blueprints \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <TOKEN>' \
  -d '{ "author":"john", "name":"casa", "points":[] }'

# 2. Listar por autor
curl -s http://localhost:8082/api/blueprints/john \
  -H 'Authorization: Bearer <TOKEN>' | jq

# 3. Obtener específico
curl -s http://localhost:8082/api/blueprints/john/casa \
  -H 'Authorization: Bearer <TOKEN>' | jq

# 4. Eliminar
curl -i -X DELETE http://localhost:8082/api/blueprints/john/casa \
  -H 'Authorization: Bearer <TOKEN>'
```

### Caso 3: Colaboración en Tiempo Real
1. Abre `http://localhost:5173` en navegador.
2. Login con `user` / `password123`.
3. Crea un blueprint (ej: "juan" / "casa").
4. **Abre una segunda pestaña** con la misma URL.
5. En ambas pestañas, selecciona el mismo blueprint.
6. Dibuja en el canvas de la **pestaña 1** (haz clic).
7. Observa cómo los puntos aparecen **automáticamente en la pestaña 2** vía STOMP.
8. Cambia de pestaña e intenta dibujar; verás sincronización bidireccional.

---

## Troubleshooting

### Backend
| Problema | Solución |
|----------|----------|
| `Port 8082 already in use` | `Stop-Process -Id <PID> -Force` (Windows) o identifica proceso con `lsof -i :8082` (Linux/Mac) |
| `CORS error` en frontend | Verifica que `SecurityConfig.setAllowedOriginPatterns()` incluya tu origen |
| `Swagger no carga` | Verifica `springdoc-openapi` en `pom.xml`; abre `/swagger-ui.html` |
| `STOMP no conecta` | Revisa token en conexión; verifica `WebSocketConfig` tiene `setAllowedOriginPatterns()` |

### Frontend
| Problema | Solución |
|----------|----------|
| `Cannot GET /` | Asegúrate que Vite está corriendo (`npm run dev`) |
| `Login falla (403/401)` | Verifica credenciales (`user`/`password123`); revisa backend logs |
| `No hay sincronización STOMP` | Abre DevTools → Network → WS; verifica conexión a `/ws-blueprints` |
| `Módulos no encontrados` | Ejecuta `npm install` en `React_Client` |

### Desarrollo Avanzado
- **Cambiar puerto backend:** Edita `application.yml` (`server.port: 8083`).
- **Cambiar puerto frontend:** Ejecuta `npm run dev -- --port 3000`.
- **PostgreSQL:** Descomentar en `docker-compose.yml`; configurar en `application.yml`.
- **Filtros de puntos:** Implementa `BlueprintsFilter` e inyecta en `BlueprintsService`.

---

## Referencias Útiles

- [Spring Boot 3.3.x Docs](https://spring.io/projects/spring-boot)
- [Spring WebSocket + STOMP](https://spring.io/guides/gs/messaging-stomp-websocket/)
- [Spring Security JWT](https://spring.io/projects/spring-security)
- [React 18 Docs](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [@stomp/stompjs](https://stomp-js.github.io/stomp-websocket/)
- [Vite](https://vitejs.dev)
- [Vitest](https://vitest.dev)

- `GET /api/v1/blueprints`
- `GET /api/v1/blueprints/{author}`
- `GET /api/v1/blueprints/{author}/{bpname}`
- `POST /api/v1/blueprints`
- `PUT /api/v1/blueprints/{author}/{bpname}/points`
- `PUT /api/v1/blueprints/{author}/{bpname}`
- `DELETE /api/v1/blueprints/{author}/{bpname}`
- `POST /api/auth/login`

## 11. Documentacion complementaria

- `React_Client/README.md`: guia del laboratorio frontend.
- `React_Client/README_MAIN.md`: guia detallada del monorepo/frontend.

## 12. Troubleshooting rapido

- Si el frontend no conecta:
  - Verifica que backend este en `http://localhost:8081`.
  - Verifica `VITE_API_BASE_URL` en `React_Client/.env`.
- Si falla PostgreSQL:
  - Revisa `docker ps` y logs del contenedor `blueprints-postgres`.
  - Verifica credenciales `postgres/postgres`.
- Si hay error de CORS:
  - Abre frontend en `http://localhost:5173` (origen permitido en backend).

## 13. Parte 4 aplicada sobre Parte_3 (tiempo real)

Esta version integra los requerimientos de colaboracion en vivo de la Parte 4 sobre el codigo base de Parte_3.

### Backend (Spring + STOMP)

- Endpoint websocket STOMP: `/ws-blueprints`
- Entrada de eventos de dibujo: `@MessageMapping("/draw")` (destino cliente: `/app/draw`)
- Publicacion por plano: `/topic/blueprints.{author}.{name}`
- Las rutas REST son compatibles en ambas variantes:
  - `/api/v1/blueprints/**` (version actual)
  - `/api/blueprints/**` (compatibilidad con enunciado Parte 4)

### Frontend (React_Client)

- Selector de tecnologia RT en la vista principal:
  - `None`
  - `Socket.IO` (opcional, backend Node externo)
  - `STOMP` (recomendado con este backend)
- Canvas interactivo:
  - Click agrega punto local en `None`.
  - En `STOMP`, publica a `/app/draw` y sincroniza por topic del plano.
  - En `Socket.IO`, usa `join-room` y `draw-event` (si el backend Node esta disponible).

### Variables de entorno nuevas (React_Client/.env)

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_STOMP_BASE=http://localhost:8081
VITE_IO_BASE=http://localhost:3001
VITE_USE_MOCK=false
```

### Prueba minima de colaboracion (2 pestanas)

1. Levantar backend Spring en `8081`.
2. Levantar frontend React en `5173` con `VITE_USE_MOCK=false`.
3. Abrir la misma URL en 2 pestanas.
4. Cargar el mismo blueprint (`author` y `name`).
5. Seleccionar `STOMP` en ambas pestanas y dibujar con click en el canvas.
6. Verificar que los puntos se replican en tiempo real.
