# 🧰 Guía de Setup del Entorno de Desarrollo
 
Esta guía describe los pasos necesarios para configurar el entorno de desarrollo local del proyecto
Sistema Distribuido para Ferias Gastronómicas.
 
Debe ser seguida por todos los integrantes del equipo antes de comenzar a trabajar en cualquier tarea.
 
--------------------------------------------------------------------------------
 
## 📋 Requisitos previos
 
Cada integrante debe tener instalado en su equipo:
 
- Git
- Node.js (v18 o superior)
- Docker Desktop
- NestJS CLI
 
  npm install -g @nestjs/cli
 
- (Opcional) DBeaver / PgAdmin para administración de bases de datos
 
--------------------------------------------------------------------------------
 
## 📥 1️⃣ Clonar el repositorio
 
git clone https: github.com/<usuario>/<repo>.git
cd Jimenez-Sanchez-Valbuena-tep-sistema-ferias-gastronomicas
 
Cambiar a la rama develop:
 
git checkout develop
 
--------------------------------------------------------------------------------
 
  ## 🐳 2️⃣ Levantar las bases de datos con Docker

Desde la raíz del proyecto ejecutar:
 
docker compose up -d
 
Verificar que los contenedores estén activos:

docker ps
 
Deben aparecer los siguientes contenedores:
 
- postgres-users (puerto 5433)
- postgres-stands (puerto 5434)
- postgres-products (puerto 5435)
- postgres-orders (puerto 5436)
 
--------------------------------------------------------------------------------
 
## 🧱 3️⃣ Configuración de variables de entorno
 
Cada microservicio utiliza su propia base de datos, por lo tanto cada uno debe
tener su archivo .env.
 
Los archivos .env NO deben subirse al repositorio.
 
--------------------------------------------------------------------------------
 
### 🔐 Microservicio Usuarios y Autenticación (ms-users-auth)
 
Archivo: ms-users-auth/.env

DB_HOST=localhost
DB_PORT=5433
DB_USER=users_user
DB_PASSWORD=users_pass
DB_NAME=users_db
 
--------------------------------------------------------------------------------
 
### 🏪 Microservicio Puestos Gastronómicos (ms-stands)
 
Archivo: ms-stands/.env
 
DB_HOST=localhost
DB_PORT=5434
DB_USER=stands_user
DB_PASSWORD=stands_pass
DB_NAME=stands_db
 
--------------------------------------------------------------------------------
 
### 🍔 Microservicio Productos y Catálogo (ms-products)
 
Archivo: ms-products/.env
 
DB_HOST=localhost
DB_PORT=5435
DB_USER=products_user
DB_PASSWORD=products_pass
DB_NAME=products_db
 
--------------------------------------------------------------------------------
 
### 🧾 Microservicio Pedidos y Ventas (ms-orders)
 
Archivo: ms-orders/.env
 
DB_HOST=localhost
DB_PORT=5436
DB_USER=orders_user
DB_PASSWORD=orders_pass
DB_NAME=orders_db
 
--------------------------------------------------------------------------------
 
## 📦 4️⃣ Instalación de dependencias
 
Cada integrante debe instalar las dependencias únicamente en el microservicio que va a desarrollar.
 
Ejemplo para ms-stands:
 
cd ms-stands
npm install
npm install @nestjs/typeorm typeorm pg @nestjs/config
 
Repetir el procedimiento en el microservicio correspondiente.
 
--------------------------------------------------------------------------------

## ▶️ 5️⃣ Ejecutar el microservicio
 
Desde la carpeta del microservicio:
 
npm run start:dev
 
Si el setup es correcto:
- NestJS inicia sin errores
- Se conecta a PostgreSQL
- Las tablas se crean automáticamente (si synchronize está habilitado)
 
--------------------------------------------------------------------------------
 
## 🔁 6️⃣ Flujo de trabajo con Git (GitFlow)
 
Antes de comenzar una tarea:
 
git checkout develop
git pull origin develop
git checkout -b feature/#tarea
 
Ejemplo:
 
git checkout -b feature/3
 
--------------------------------------------------------------------------------
 
### Al finalizar una tarea:
 
git add .
git commit -m "feat: descripción clara de la tarea"
git push origin feature/3
 
Luego:
- Abrir un Pull Request hacia develop
- Asignar revisores
- Realizar merge solo después de la aprobación
 
--------------------------------------------------------------------------------
 
## 🚫 Reglas importantes
 
- NO trabajar directamente sobre la rama develop
- NO subir archivos .env
- NO compartir entidades ni lógica entre microservicios
- NO usar claves foráneas entre bases de datos
- NO acceder a microservicios directamente desde Postman
 
--------------------------------------------------------------------------------
 
## 🧠 Notas de arquitectura
 
- Arquitectura basada en microservicios
- Comunicación entre servicios mediante RPC (TCP)
- El API Gateway es el único punto de entrada al sistema
- Los identificadores entre servicios se manejan por UUID

--------------------------------------------------------------------------------
 
## 🧪 Pruebas
 
- Todas las pruebas deben realizarse a través del API Gateway
- La colección de Postman debe apuntar únicamente al Gateway
- Los microservicios no se consumen directamente desde el cliente
 
--------------------------------------------------------------------------------
 
## ✅ Checklist de verificación
 
Antes de comenzar a desarrollar, cada integrante debe confirmar:
 
[ ] Repositorio clonado
[ ] Rama develop actualizada
[ ] Docker corriendo
[ ] Bases de datos levantadas
[ ] Archivo .env creado
[ ] Microservicio ejecutando sin errores
[ ] Rama feature/#tarea creada
