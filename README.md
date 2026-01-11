# Jimenez-Sanchez-Valbuena-tep-sistema-ferias-gastronomicas
Repositorio para el proyecto final de Topicos especiales de la programacion

# Sistema distribuido para ferias gastronómicas

Proyecto final – Tópicos Especiales de Programación

## Arquitectura
- API Gateway (NestJS)
- Microservicio Usuarios y Autenticación
- Microservicio Puestos Gastronómicos
- Microservicio Productos
- Microservicio Pedidos y Ventas

## Stack
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Microservicios TCP
- JWT

# 📦 Proyecto Final – Sistema Distribuido para Ferias Gastronómicas

## 📌 Organización del trabajo (Tareas)

El desarrollo del sistema se organiza en tareas numeradas, asignadas a los integrantes del equipo, siguiendo GitFlow y una arquitectura de microservicios.

---

## 🟢 TAREA 0 – Inicialización del proyecto (COMPLETADA)
**Responsables:** Todo el equipo

### Incluye:
- Creación del monorepo
- Configuración de ramas `main` y `develop`
- Creación de microservicios NestJS
- Configuración de Docker Compose
- Bases de datos PostgreSQL independientes
- Conexión inicial de `ms-users-auth` con TypeORM

---

## 🔐 MICROSERVICIO: USUARIOS Y AUTENTICACIÓN

### 🟢 TAREA 1 – Gestión de Usuarios
**Responsable:** Cristian Jimenez 
**Rama:** `feature/1`

#### Subtareas:
- 1.1 Creación del `UsersModule`
- 1.2 Entidad `User`
- 1.3 DTOs de creación y actualización
- 1.4 CRUD básico de usuarios
- 1.5 Registro de usuarios por rol:
  - cliente
  - emprendedor
  - organizador
- 1.6 Validaciones de datos
- 1.7 Restricción: cada usuario solo puede modificar su perfil

---

### 🟢 TAREA 2 – Autenticación y Autorización
**Responsable:** Cristian Jimenez  
**Rama:** `feature/2`

#### Subtareas:
- 2.1 Login de usuarios (integración con microservicio Users)
- 2.2 Encriptación de contraseñas
- 2.3 Emisión de JWT
- 2.4 Guards de autenticación
- 2.5 Guards de roles
- 2.6 Decorators personalizados (`@Roles`)
- 2.7 Validación de token para otros microservicios (RPC)

---

## 🏪 MICROSERVICIO: PUESTOS GASTRONÓMICOS

### 🟢 TAREA 3 – Gestión de Puestos
**Responsable:** Luis Valbuena 
**Rama:** `feature/3`

#### Subtareas:
- 3.1 Creación del `StandsModule`
- 3.2 Entidad `Stand`
- 3.3 CRUD de puestos
- 3.4 Estados del puesto:
  - pendiente
  - aprobado
  - activo
- 3.5 Asociación emprendedor ↔ puesto
- 3.6 Validación de ownership
- 3.7 Aprobación de puestos por organizador
- 3.8 Activación e inactivación

---

## 🍔 MICROSERVICIO: PRODUCTOS Y CATÁLOGO

### 🟢 TAREA 4 – Gestión de Productos
**Responsable:** Juan Sanchez
**Rama:** `feature/4`

#### Subtareas:
- 4.1 Creación del `ProductsModule`
- 4.2 Entidad `Product`
- 4.3 CRUD de productos
- 4.4 Control de stock
- 4.5 Disponibilidad de productos
- 4.6 Asociación producto ↔ puesto (por ID)
- 4.7 Validación de puesto activo (RPC con stands)
- 4.8 Validación de ownership del puesto

---

### 🟢 TAREA 5 – Catálogo Público
**Responsable:** Juan Sanchez
**Rama:** `feature/5`

#### Subtareas:
- 5.1 Listado de puestos activos
- 5.2 Listado de productos disponibles
- 5.3 Filtros:
  - categoría
  - puesto
  - rango de precios
- 5.4 Exclusión de productos sin stock

---

## 🧾 MICROSERVICIO: PEDIDOS Y VENTAS

### 🟢 TAREA 6 – Pedidos
**Responsable:** Por asignar
**Rama:** `feature/6`

#### Subtareas:
- 6.1 Creación de pedidos
- 6.2 Estados del pedido:
  - pendiente
  - preparando
  - listo
  - entregado
- 6.3 Verificación de stock (RPC con productos)
- 6.4 Descuento automático de inventario
- 6.5 Validación de puesto activo (RPC con stands)
- 6.6 Historial de pedidos del cliente
- 6.7 Registro de ventas por puesto

---

### 🟢 TAREA 7 – Estadísticas y Panel del Organizador
**Responsable:** Por Asignar
**Rama:** `feature/7`

#### Subtareas:
- 7.1 Vista global del evento
- 7.2 Filtros por:
  - fecha
  - puesto
  - estado
  - categoría
- 7.3 Estadísticas:
  - ventas por puesto
  - producto más vendido
  - volumen total por día
  - pedidos completados

---

## 🌐 INFRAESTRUCTURA Y TRANSVERSALES

### 🟢 TAREA 8 – API Gateway
**Responsables:** Por asignar 
**Rama:** `feature/8`

#### Subtareas:
- 8.1 Configuración del API Gateway
- 8.2 Enrutamiento a microservicios
- 8.3 Validación de JWT
- 8.4 Exposición de endpoints finales
- 8.5 Documentación del Gateway

---

### 🟢 TAREA 9 – Logging, Errores y AOP
**Responsables:** Por asignar 
**Rama:** `feature/9`

#### Subtareas:
- 9.1 Interceptors de logging
- 9.2 Registro de:
  - ruta
  - usuario
  - timestamp
  - resultado
- 9.3 Manejo global de errores
- 9.4 Uso de programación orientada a aspectos (AOP)

---

## 🔁 Flujo de trabajo (GitFlow)

- Cada tarea se desarrolla en una rama `feature/#tarea`
- Al finalizar la tarea:
  - Se abre un Pull Request a `develop`
  - Se asignan revisores
  - Se realiza merge tras aprobación
- La rama `main` se utiliza únicamente para la entrega final

