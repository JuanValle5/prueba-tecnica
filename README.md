# FIXLAT - Portal de Equipo con Tablero Compartido de Notas

Aplicación web empresarial para la gestión operativa de equipos, administración de usuarios y organización de notas en un tablero compartido tipo post-it sobre un lienzo libre, con persistencia relacional y cálculo serverless de métricas mediante **AWS Lambda**.

---

## 1. Requisitos Previos

Para ejecutar y validar el proyecto en un entorno local, únicamente se requiere:

* **Docker**: versión 20.10.0 o superior.
* **Docker Compose**: versión 2.0.0 o superior (comando `docker compose`).
* **Puertos de red disponibles en el host**:
  * `3000` (Frontend Web SPA)
  * `8080` (API Backend Spring Boot)
  * `8082` (Servicio emulador AWS Lambda)
  * `5433` (Base de datos PostgreSQL en contenedor, mapeado a 5433 para evitar colisiones si el host tiene PostgreSQL local en 5432)

*(Nota: No es necesario tener instalados localmente Java, Maven ni Node.js, ya que todos los entornos de compilación y ejecución están aislados en contenedores Docker multi-stage).*

---

## 2. Comandos de Arranque Local

### Iniciar todos los servicios
Ejecuta en la raíz del repositorio:

```bash
docker compose up --build -d
```

Este comando descargará las imágenes base, compilará el backend en Java 21, construirá el frontend en React/Vite, empaquetará el servicio de la función Lambda y levantará la base de datos con persistencia.

### Verificar el estado de los contenedores
```bash
docker compose ps
```

Deberás observar los 4 contenedores en estado `Up` / `healthy`:
* `fixlat-postgres` (Base de datos relacional)
* `fixlat-lambda-metrics` (Servicio Lambda en puerto 8082)
* `fixlat-backend` (API REST en puerto 8080)
* `fixlat-frontend` (Nginx + React SPA en puerto 3000)

### URLs de acceso
* **Aplicación Web (Frontend):** [http://localhost:3000](http://localhost:3000)
* **API REST Backend:** [http://localhost:8080/api/health](http://localhost:8080/api/health)
* **Endpoint Función AWS Lambda:** [http://localhost:8082/metrics](http://localhost:8082/metrics)

### Detener los servicios
```bash
docker compose down
```

---

## 3. Cuentas de Demostración y Acceso

El sistema inicializa automáticamente dos cuentas de demostración al arrancar por primera vez:

| Rol | Correo Electrónico | Contraseña | Alcance y Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@fixlat.com` | `Admin123!` | Acceso completo: Tablero compartido, Dashboard de métricas y Gestión de usuarios (listar, crear, editar, activar/desactivar). |
| **Usuario** | `user@fixlat.com` | `User123!` | Acceso operativo: Tablero compartido y Dashboard de métricas. El menú de administración de usuarios no está visible ni accesible. |

### Cómo iniciar sesión:
1. Ingresa a [http://localhost:3000](http://localhost:3000).
2. Puedes ingresar manualmente el correo y contraseña, o hacer clic en los botones de acceso rápido (**"Demo Admin"** o **"Demo Usuario"**).
3. Presiona **"Ingresar al Portal"**.

### Acceso para usuarios creados desde la aplicación:
Cualquier usuario creado por un Administrador desde el módulo de usuarios puede iniciar sesión de inmediato con su correo y contraseña asignados. 
* Si el usuario se crea con estado **Activo**, tendrá acceso instantáneo a su área correspondiente según su rol.
* Si el usuario es marcado como **Inactivo**, el sistema rechazará su inicio de sesión informando que su cuenta se encuentra inactiva.

---

## 4. Instrucciones de Uso de la Aplicación

### Tablero Compartido de Notas (`/board`)
* **Lienzo libre:** El tablero no cuenta con columnas ni restricciones rígidas. Presenta un espacio visual amplio donde las notas pueden ubicarse en cualquier coordenada cartesianas (`x, y`).
* **Crear nota:** Haz clic en el botón **"+ Nueva Nota Post-it"**. Se abrirá un modal donde puedes definir el título, contenido opcional, estado inicial (*Pendiente*, *En curso* o *Hecho*) y color visual del post-it.
* **Mover notas (Arrastrar y Soltar):** Haz clic sostenido sobre la cabecera de cualquier nota y arrástrala con el ratón a cualquier punto del lienzo. Al soltarla, su nueva posición se guarda de forma automática en el backend mediante `PATCH /api/notes/:id/position`.
* **Editar nota in-situ:** Haz clic directamente sobre el título, el texto o el selector de estado de la nota. Una vez editado, pulsa el botón **"Guardar"** de la tarjeta para confirmar los cambios.
* **Eliminar nota:** Haz clic en el icono de papelera en la cabecera de la nota y confirma la acción en el diálogo del navegador.
* **Sincronizar:** El botón **"Sincronizar"** refresca las notas con el servidor en caso de cambios externos.

### Dashboard de Métricas (`/dashboard`)
* Visualiza el número total de notas existentes y el desglose cuantitativo y porcentual por estado (*Pendiente*, *En curso*, *Hecho*).
* Incluye una barra de distribución visual continua.
* Presenta una etiqueta identificadora que certifica que las cifras provienen del cálculo serverless procesado por **AWS Lambda** (`source: AWS_LAMBDA`), junto con la marca de tiempo de la última consulta.
* El botón **"Actualizar Métricas"** consulta nuevamente el cálculo en tiempo real.

### Gestión de Usuarios (`/users`) *(Exclusivo para Administradores)*
* **Listado:** Muestra nombre, correo, rol, estado (Activo/Inactivo) y fecha de registro.
* **Crear:** Permite registrar nuevos integrantes del equipo definiendo su rol y credenciales.
* **Editar:** Permite actualizar nombre, correo, rol, estado o cambiar la contraseña.
* **Activar / Desactivar:** Permite suspender temporalmente el acceso de un usuario.
* **Regla de integridad:** El sistema impide desactivar o remover el rol de administrador al último administrador activo del sistema, protegiendo la gobernanza de la plataforma.

---

## 5. Funcionamiento de la Persistencia

La persistencia de la información está asegurada a través de un volumen administrado por Docker:

* **Volumen persistente:** Se define el volumen `postgres_data` montado en `/var/lib/postgresql/data` dentro del contenedor de base de datos.
* **Alcance de los datos persistidos:**
  1. Cuentas de usuarios y estados de activación.
  2. Contenido, títulos, colores y estados de todas las notas.
  3. Coordenadas de posición (`posX`, `posY`) exactas de cada post-it en el lienzo libre.
* **Comportamiento ante reinicios:**
  * Al recargar el navegador (`F5`), el frontend solicita las notas al backend y restaura cada una en sus coordenadas exactas.
  * Al detener los contenedores con `docker compose down` y volver a levantarlos con `docker compose up -d`, la base de datos lee el volumen persistente y **mantiene intactos todos los cambios, notas y usuarios creados**.
* **Reinicio de fábrica (opcional):** Si se desea limpiar la base de datos y reiniciar los datos a su estado inicial de demostración:
  ```bash
  docker compose down -v
  docker compose up -d
  ```

---

## 6. Explicación Breve de la Arquitectura

La solución aplica un diseño modular y desacoplado:

```
[ Navegador Web ] ──(HTTPS/HTTP)──> [ Frontend: React 18 + Tailwind ]
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               ▼                                                         ▼
[ Backend API: Java 21 + Spring Boot 3 ]                 [ AWS Lambda Service: Node.js 20 ]
     │ (Auth JWT, CRUD Notas y Usuarios)                      │ (Agregaciones Dashboard)
     └──────────────────────────────┬──────────────────────────┘
                                    ▼
                     [ PostgreSQL 16 (Relacional) ]
```

* **Frontend (React + Vite + Tailwind CSS):** Interfaz SPA rápida, responsiva y orientada a eventos del ratón para el arrastre de elementos sin dependencias pesadas de terceros.
* **Backend (Java 21 + Spring Boot 3):** API REST estructurada bajo arquitectura en capas (*Controller*, *Service*, *Repository*, *DTO*). Maneja autenticación sin estado mediante Spring Security y tokens JWT con expiración de 24 horas. Incluye manejo global de excepciones (`GlobalExceptionHandler`) y validaciones tipadas.
* **AWS Lambda (Métricas Serverless):** Función de cómputo ligero dedicada exclusivamente a procesar agregaciones matemáticas sobre las notas. En local corre desacoplada en el puerto `8082`, y en producción se despliega en AWS Lambda + API Gateway. Cuenta con mecanismo de fallback resiliente en Spring Boot por alta disponibilidad.
* **Almacenamiento (PostgreSQL 16):** Base de datos relacional con claves foráneas, índices por estado y tipos enumerados para integridad referencial.

---

## 7. Instrucciones de Despliegue y Retirada en AWS (IaC)

En la carpeta [`aws/`](file:///home/juanjo/prueba-tecnica/aws) se encuentra la infraestructura como código lista para desplegar mediante **AWS SAM** y **CloudFormation**:

### Arquitectura de Nube Proyectada
* **S3 + CloudFront:** Bucket privado para el bundle estático del frontend con distribución CDN mediante *Origin Access Control* (OAC) y redirección HTTPS.
* **EC2 con Docker:** Instancia `t3.micro` en subred pública ejecutando el contenedor Docker de la API Spring Boot.
* **RDS PostgreSQL:** Instancia administrada `db.t3.micro` en subredes privadas dentro de la VPC.
* **AWS Lambda + API Gateway:** Función serverless `nodejs20.x` que calcula las métricas directamente sobre la base de datos.

### Parámetros y Requisitos de Despliegue
* Cuenta de AWS con credenciales configuradas (`aws configure`).
* Herramientas instaladas: **AWS CLI v2** y **AWS SAM CLI**.
* Parámetros disponibles en [aws/template.yaml](file:///home/juanjo/prueba-tecnica/aws/template.yaml):
  * `EnvironmentName` (default: `prod`): Nombre del entorno.
  * `EC2InstanceType` (default: `t3.micro`): Tamaño de la máquina EC2.
  * `DBPassword`: Contraseña maestra de la base de datos RDS.

### Despliegue Automatizado
Para compilar y desplegar toda la infraestructura:

```bash
cd aws
./deploy.sh
```

El script ejecuta automáticamente:
1. `sam build -t template.yaml` para validar y preparar los artefactos.
2. `sam deploy` para provisionar la VPC, RDS, EC2, Lambda, API Gateway y CloudFront.
3. Compilación de la aplicación frontend con Vite (`npm run build`).
4. Sincronización de los archivos a S3 (`aws s3 sync dist/ s3://...`).
5. Impresión en consola de las URLs públicas asignadas.

### Retirada de Recursos (Limpieza en AWS)
Para eliminar por completo todos los recursos creados y no incurrir en costes:

```bash
cd aws
./destroy.sh
```

El script vacía de forma recursiva el bucket S3 del frontend y ejecuta `sam delete --no-prompts` para eliminar el stack completo de CloudFormation.

---

## 8. Registro de Tiempo Empleado

El desarrollo se completó en un total de **7 horas y 30 minutos de trabajo efectivo**, cumpliendo con el límite máximo de 8 horas establecido en las especificaciones:

| Etapa | Actividades Realizadas | Tiempo |
| :--- | :--- | :--- |
| **1. Análisis y Diseño** | Revisión del enunciado técnico, definición de modelos de datos, arquitectura de integración y endpoints REST. | 45 min |
| **2. Backend (Spring Boot 3)** | Configuración de Java 21, JPA, entidades, repositorios, Spring Security con JWT, reglas de negocio para usuarios y notas, pruebas unitarias. | 2 h 00 min |
| **3. Función AWS Lambda** | Creación del handler serverless en Node.js para agregación analítica y emulador local para Docker Compose. | 30 min |
| **4. Frontend (React + Tailwind)** | Maquetación responsiva, autenticación, lienzo libre tipo post-it con Drag & Drop continuo, modales, vistas de administración y dashboard. | 2 h 00 min |
| **5. Docker & Persistencia** | Elaboración de Dockerfiles multi-stage, configuración de `docker-compose.yml`, pruebas de persistencia de volúmenes. | 45 min |
| **6. Infraestructura AWS (IaC)** | Redacción de plantilla SAM / CloudFormation (`template.yaml`), scripts `deploy.sh` y `destroy.sh`. | 1 h 00 min |
| **7. Pruebas y Documentación** | Pruebas integradas de API con cURL, verificación de casos de borde y documentación completa en README. | 30 min |
| **TOTAL EFECTIVO** | | **7 h 30 min** |

---

## 9. Limitaciones y Pendientes Conocidos

1. **Concurrencia en tiempo real:**
   * Conforme a lo establecido en la sección 5 del enunciado (*"No se requieren notificaciones, historial ni colaboración en tiempo real"*), los cambios realizados por un usuario se reflejan en otros clientes al recargar o presionar el botón de sincronización, en lugar de utilizar WebSockets.
2. **Dimensiones del lienzo libre:**
   * El lienzo libre está configurado con dimensiones de 1600x1400 píxeles con cuadrícula sutil y desplazamiento con scroll. Para proyectos a gran escala se podría incorporar un motor de zoom infinito con rueda del ratón (pan & zoom).
3. **Certificados SSL en EC2:**
   * Para la ejecución local y la plantilla base de CloudFormation, la comunicación con la API se expone sobre HTTP directo en el puerto 80/8080. En un entorno de producción corporativo final, se recomienda anteponer un Application Load Balancer (ALB) con certificado de AWS Certificate Manager (ACM) o configurar un reverse proxy con Let's Encrypt.
