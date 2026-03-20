# 🤝 Guía de Contribución

> Guía para desarrolladores que quieren contribuir al monorepo ARSW

## 📁 Estructura del Proyecto

```
arsw-labs-monorepo/
├── BluePrints/                 # Backend Spring Boot + config
│   ├── src/main/java/          # Código fuente Java
│   │   └── edu/eci/arsw/blueprints/
│   │       ├── controllers/    # REST Controllers
│   │       ├── services/       # Lógica de negocio
│   │       ├── persistence/    # Repositorios (In-Memory + Postgres)
│   │       ├── model/          # Entidades JPA
│   │       ├── filters/        # Filtros de procesamiento
│   │       ├── security/       # JWT + Spring Security
│   │       ├── dto/            # DTOs y Records
│   │       └── config/         # Configuración (OpenAPI, CORS)
│   ├── src/main/resources/
│   │   ├── application.yml     # Config principal
│   │   └── application-test.yml
│   ├── src/test/java/          # Tests unitarios
│   ├── docker-compose.yml      # PostgreSQL container
│   ├── init.sql                # Script de inicialización DB
│   └── pom.xml                 # Maven dependencies
│
├── Inmortals/                  # Lab de concurrencia con threads
│   ├── src/main/java/
│   └── pom.xml
│
├── wait_notify/                # Lab de sincronización
│   ├── src/main/java/
│   └── pom.xml
│
├── src/                        # Frontend React
│   ├── components/             # Componentes reutilizables
│   │   ├── BlueprintCanvas.jsx
│   │   ├── InteractiveBlueprintCanvas.jsx
│   │   ├── BlueprintForm.jsx
│   │   └── PrivateRoute.jsx
│   ├── pages/                  # Páginas de la app
│   │   ├── BlueprintsPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── NewBlueprintPage.jsx
│   ├── features/               # Redux slices
│   │   ├── auth/authSlice.js
│   │   └── blueprints/blueprintsSlice.js
│   ├── services/               # API clients
│   │   ├── apiClient.js        # Axios + interceptores
│   │   ├── apimock.js          # Mock data
│   │   └── blueprintsService.js
│   ├── store/                  # Redux store
│   │   └── index.js
│   ├── App.jsx                 # Componente raíz
│   ├── main.jsx                # Entry point
│   └── styles.css              # Estilos globales
│
├── tests/                      # Tests del frontend
│   ├── blueprintsSlice.test.jsx
│   ├── BlueprintCanvas.test.jsx
│   ├── BlueprintForm.test.jsx
│   ├── BlueprintsPage.test.jsx
│   └── setup.js
│
├── .github/workflows/          # CI/CD
│   └── ci.yml
│
├── .gitignore                  # Git ignore (Node + Java)
├── package.json                # npm scripts y dependencias
├── vite.config.js              # Configuración Vite
├── vitest.config.js            # Configuración tests
├── eslint.config.js            # Linting rules
├── .prettierrc                 # Formatting rules
├── README_MAIN.md              # Documentación principal
├── README.md                   # Documentación React client
├── CONTRIBUTING.md             # Este archivo
├── quick-start.sh              # Script de inicio (Linux/Mac)
└── quick-start.ps1             # Script de inicio (Windows)
```

---

## 🚀 Configuración del Entorno

### Prerrequisitos
- **Java 21** (JDK)
- **Maven 3.9+**
- **Node.js 18+** y **npm**
- **Git**
- **Docker** (opcional, para PostgreSQL)
- **IDE recomendado**: IntelliJ IDEA / VS Code

### Setup Inicial

1. **Clonar el repositorio**
```bash
git clone <tu-repo-url>
cd arsw-labs-monorepo
```

2. **Ejecutar script de inicio**
```bash
# Linux/Mac
chmod +x quick-start.sh
./quick-start.sh

# Windows PowerShell
.\quick-start.ps1
```

3. **O manualmente:**
```bash
# Frontend
npm install

# Backend
cd BluePrints
mvn clean install
```

---

## 🔧 Desarrollo

### Backend (Spring Boot)

**Compilar:**
```bash
npm run backend:compile
# o
cd BluePrints && mvn compile
```

**Ejecutar tests:**
```bash
npm run backend:test
# o
cd BluePrints && mvn test
```

**Ejecutar aplicación:**
```bash
npm run backend:run
# Con PostgreSQL:
npm run backend:postgres
```

**Convenciones de código:**
- Usar Java 21 features (records, pattern matching)
- Anotar endpoints con OpenAPI (`@Operation`, `@ApiResponses`)
- DTOs como records inmutables
- Usar `@Transactional` en operaciones de escritura
- Manejo de excepciones con `@ControllerAdvice`

### Frontend (React)

**Ejecutar en desarrollo:**
```bash
npm run dev
```

**Tests:**
```bash
npm test
npm run test:ui  # UI interactiva
```

**Linting y formato:**
```bash
npm run lint
npm run format
```

**Convenciones de código:**
- Componentes funcionales con hooks
- Redux Toolkit para estado global
- Memoización con `useMemo`, `useCallback`, `createSelector`
- Async thunks para llamadas API
- Tests con Vitest + Testing Library

### PostgreSQL

**Iniciar:**
```bash
npm run docker:up
```

**Ver logs:**
```bash
npm run docker:logs
```

**Detener:**
```bash
npm run docker:down
```

---

## 🧪 Testing

### Backend Tests
```bash
cd BluePrints
mvn test

# Test específico
mvn test -Dtest=BlueprintsAPIControllerTest
```

### Frontend Tests
```bash
npm test

# Con coverage
npm run test:coverage

# Modo watch
npm run test:ui
```

**Convenciones de testing:**
- Tests unitarios para slices y utilidades
- Tests de componentes con `@testing-library/react`
- Mockear dependencias externas con `vi.mock()`
- Cobertura mínima: 80%

---

## 📝 Estilo de Código

### Java
- Indentación: 4 espacios
- Línea máxima: 120 caracteres
- Usar Records para DTOs
- Usar `var` cuando el tipo es evidente
- Javadoc en APIs públicas

### JavaScript/React
- Indentación: 2 espacios
- Línea máxima: 100 caracteres
- Single quotes para strings
- Trailing commas en objetos/arrays
- ESLint + Prettier configurados

---

## 🔀 Flujo de Trabajo Git

1. **Crear rama desde main**
```bash
git checkout -b feature/nueva-funcionalidad
```

2. **Hacer commits descriptivos**
```bash
git commit -m "feat: agregar endpoint DELETE blueprint"
git commit -m "fix: corregir optimistic update en Redux"
git commit -m "docs: actualizar README con nuevos scripts"
```

**Convención de commits:**
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Documentación
- `style:` - Formato de código
- `refactor:` - Refactorización
- `test:` - Tests
- `chore:` - Tareas de mantenimiento

3. **Push y Pull Request**
```bash
git push origin feature/nueva-funcionalidad
```

---

## 📦 Agregar Nuevas Funcionalidades

### Nuevo Endpoint Backend

1. **Crear DTO si es necesario**
```java
// dto/NewRequest.java
public record NewRequest(String field1, String field2) {}
```

2. **Agregar método en Controller**
```java
@PostMapping("/ruta")
@Operation(summary = "Descripción")
public ResponseEntity<ApiResponse<T>> metodo(@RequestBody NewRequest req) {
    // ...
}
```

3. **Implementar lógica en Service**
```java
public T metodoBusiness(NewRequest req) {
    // lógica
}
```

4. **Actualizar Persistence si es necesario**

5. **Escribir test**
```java
@Test
void testNuevoEndpoint() {
    // ...
}
```

### Nueva Funcionalidad Frontend

1. **Crear/actualizar slice si afecta estado global**
```javascript
export const nuevoThunk = createAsyncThunk('slice/accion', async (params) => {
  const { data } = await api.post('/ruta', params)
  return data
})
```

2. **Crear/actualizar componente**
```jsx
export default function NuevoComponente() {
  const dispatch = useDispatch()
  // ...
}
```

3. **Escribir test**
```javascript
describe('NuevoComponente', () => {
  it('should...', () => {
    // ...
  })
})
```

---

## 🐛 Debugging

### Backend
- Usar logs: `logger.info()`, `logger.error()`
- Debug en IDE con breakpoints
- Revisar logs de Spring Boot
- Swagger UI para probar endpoints

### Frontend
- React DevTools (extensión Chrome/Firefox)
- Redux DevTools (extensión Chrome/Firefox)
- `console.log()` en desarrollo
- Network tab en DevTools

---

## 📚 Recursos

### Documentación
- [Spring Boot Docs](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [React Docs](https://react.dev/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Vitest Docs](https://vitest.dev/)

### APIs del Proyecto
- Backend: http://localhost:8081/swagger-ui.html
- Frontend: http://localhost:5173

---

## ✅ Checklist antes de Pull Request

- [ ] Código compila sin errores
- [ ] Todos los tests pasan
- [ ] Linting pasa (`npm run lint`)
- [ ] Código formateado (`npm run format`)
- [ ] Documentación actualizada si es necesario
- [ ] Commits descriptivos
- [ ] No hay console.logs o código comentado
- [ ] Variables de entorno documentadas si se agregaron

---

## 🤔 ¿Preguntas?

Consulta el [README_MAIN.md](./README_MAIN.md) o abre un issue en GitHub.

¡Gracias por contribuir! 🎉
