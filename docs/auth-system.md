# Sistema de Autenticación — Documentación Concisa

Resumen breve: autenticación JWT con Ionic Storage, interceptor HTTP, guardas de ruta y roles basados en dominio de email. Esta documentación explica qué hace cada módulo/función, cómo se conectan y cómo usar el sistema.

---

**Ubicación principal de código**
- Servicios: `src/app/service/`  
  - `storage.service.ts`  
  - `auth.service.ts`  
  - `auth.interceptor.ts`  
  - `auth.guard.ts`  
- Cliente API: `src/app/service/http-client.ts` (endpoints login/register/logout/refresh)  
- Interceptor registrado en `src/main.ts`  

---

## 1) `StorageService` — Rol
Guarda de forma persistente: `access_token`, `refresh_token`, `user` y `role`. Exporta métodos asincrónicos simples para lectura/escritura.

Funciones clave y qué hacen:
- `init()` / `ensureReady()` — Inicializa Ionic Storage.
- `setAccessToken(token)` / `getAccessToken()` — Guardar/leer access token.
- `setRefreshToken(token)` / `getRefreshToken()` — Guardar/leer refresh token.
- `setTokens(access, refresh)` / `getTokens()` — Guardar/leer ambos.
- `setUser(user)` / `getUser()` — Guardar/leer objeto usuario (respuesta del backend).
- `setRole(role)` / `getRole()` / `clearRole()` — Guardar/leer/limpiar rol calculado.
- `clearTokens()` / `clearUser()` / `clearSession()` — Limpian datos; `clearSession()` borra tokens, user y role.
- `hasSession()` — Verifica si existe `access_token`.

Cómo se usa en el flujo:
- `AuthService` guarda/lee datos de sesión usando estos métodos.
- `AuthInterceptor` sólo lee `access_token` antes de enviar peticiones.

---

## 2) `AuthService` — Rol
Centraliza lógica de login/register/logout, manejo de tokens, estado reactivo del usuario y rol.

Funciones clave y qué hacen:
- `login(email, password)` — Llama a `ApiService.login`, si éxito llama `handleAuthSuccess(response)`.
- `register(email, password, first_name, last_name)` — Llama a `ApiService.register`, si éxito llama `handleAuthSuccess(response)`.
- `logout()` — Lee `refresh_token` desde `StorageService`, llama a `ApiService.logout({refresh})`. Limpia sesión local aunque el backend falle.
- `refreshAccessToken()` — Llama `ApiService.refreshToken({refresh})` y actualiza `access_token`; si falla limpia sesión.
- `handleAuthSuccess(response)` — Guarda `access` y `refresh`, guarda `user`, determina rol desde `user.email` (ver reglas abajo), guarda rol y actualiza observables: `currentUser$`, `currentRole$`, `isAuthenticated$`.
- `handleLogoutSuccess()` — Limpia storage y actualiza observables a null/false.
- `determineRoleFromEmail(email)` — Reglas de asignación de rol (ver sección Roles).
- `isInRole(role)` — Helper síncrono para comprobaciones rápidas.

Estado observable público:
- `currentUser$` — Usuario actual o `null`.
- `currentRole$` — Rol calculado (`administrativo` | `coordinador` | `alumno`) o `null`.
- `isAuthenticated$` — Booleano.

Cómo se usa en el flujo:
- Componentes llaman `authService.login()` / `register()` para autenticación.
- Componentes y guardas usan `currentRole$`, `isAuthenticated$` o `isInRole()` para lógica de UI/permiso.
- `AuthInterceptor` y `AuthGuard` dependen del estado que mantiene `AuthService`.

---

## 3) `AuthInterceptor` — Rol
Añade `Authorization: Bearer <access_token>` a peticiones y maneja 401 para refresh automático.

Comportamiento clave:
- Antes de enviar una petición: lee `access_token` desde `AuthService.getAccessToken()` y, si existe y no está expirado, lo añade en header.
- Si respuesta es 401: intenta `authService.refreshAccessToken()` una sola vez (lock con BehaviorSubject para evitar múltiples refresh simultáneos). Si refresh funciona, reintenta la petición con el nuevo token. Si falla, la sesión se limpia.

Notas:
- Interceptor hace una decodificación básica del JWT para revisar `exp` antes de enviar.

---

## 4) `AuthGuard` — Rol
Protege rutas que requieren autenticación (canActivate).

Comportamiento:
- Observa `authService.isAuthenticated$`. Si `true` permite acceso; sino redirige a `/login` y pasa `returnUrl` en query params.

Uso:
- Añadir `canActivate: [AuthGuard]` en `app.routes.ts` para rutas que requieren login.

---

## 5) `ApiService` (http-client.ts) — Endpoints usados
- `register(payload)` → `POST /auth/register/`
- `login(payload)` → `POST /auth/login/`
- `logout(payload)` → `POST /auth/logout/` (envía `{ refresh }`)
- `refreshToken(payload)` → `POST /auth/token/refresh/` (envía `{ refresh }`)
- `getUserProfile()` → `GET /auth/me/` (opcional)

Formato esperado por el frontend en login/register (backend debe devolver esto):
```json
{
  "refresh": "...",
  "access": "...",
  "user": { "id": 2, "username": "x", "email": "x@dominio", "first_name": "X", "last_name": "Y" }
}
```

---

## Reglas de Roles (implementadas ahora)
- `administrativo` ⇢ email termina en `@duoc.cl`
- `coordinador` ⇢ email termina en `@profesor.duoc.cl`
- `alumno` ⇢ email termina en `@duocuc.cl` OR cualquier otro dominio (por ahora: default)

Observaciones:
- Estas reglas son aplicadas por `AuthService.determineRoleFromEmail(email)` al autenticarse (login/register) y al inicializar el estado desde el storage.
- El rol se guarda en storage (`role`) y está disponible vía `authService.currentRole$`.

---

## Cómo usar (conciso)
- Login: llamar `authService.login(email, password)`.
- Registro: llamar `authService.register(...)`.
- Logout: llamar `authService.logout()` (limpia localmente incluso si revoke falla).
- Mostrar usuario: suscribirse a `authService.currentUser$` o usar `authService.getCurrentUserSync()` para chequeos síncronos.
- Mostrar/usar rol: suscribirse a `authService.currentRole$` o usar `authService.getCurrentRoleSync()` / `authService.isInRole('administrativo')`.
- Proteger rutas: agregar `canActivate: [AuthGuard]` en `app.routes.ts`.

---

## Flujo resumido (cómo se conectan los módulos)
1. Usuario envía credenciales → `AuthService.login()` → `ApiService.login()`
2. Respuesta `{access, refresh, user}` → `AuthService.handleAuthSuccess()`
   - Guarda tokens y user en `StorageService`
   - Calcula rol y guarda en `StorageService`
   - Actualiza `currentUser$`, `currentRole$`, `isAuthenticated$`
3. Peticiones HTTP → `AuthInterceptor` añade `Authorization` con `access_token`
4. Si 401 → `AuthInterceptor` usa `AuthService.refreshAccessToken()` → actualiza `access_token` en `StorageService`
5. Logout → `AuthService.logout()` → `ApiService.logout({refresh})` → `AuthService.handleLogoutSuccess()` limpia `StorageService` y observables

---

## Notas operativas rápidas
- Rutas públicas (sin login): `home`, `guia-uso`, `ver-eventos`.
- Roles y protecciones por página serán aplicadas en el siguiente paso según las reglas que definiste.
- Para pruebas rápidas, cualquier email que no termine en `@duoc.cl` ni `@profesor.duoc.cl` se tratará como `alumno`.

---

Archivo conciso y único: `docs/auth-system.md` (este). Si quieres que cambie nomenclatura o el contenido (más/menos detalle), lo ajusto.
