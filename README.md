# ErgoCheck AI — Plataforma B2B SaaS de Salud Ocupacional, Supervisión de Conducta y Auditoría Criptográfica

> **Plataforma integral empresarial que combina visión artificial en el dispositivo (Edge AI), supervisión de probidad en tiempo real por WebSockets, motor de correlación de fatiga y bitácora de auditoría inmutable WORM.**

El [plan de despliegue en AWS](docs/PLAN_DESPLIEGUE_AWS.md) registra las tareas verificadas, los pendientes y las instrucciones para continuar el trabajo en equipo.

---

## 🌟 Características Principales

### 1. Ergonomía Predictiva con Edge AI (Zero-Image Policy)
- **Inferencia en el Cliente:** Análisis biomecánico en tiempo real utilizando MediaPipe Pose directamente en el navegador del usuario vía WebAssembly/WebGL.
- **Cumplimiento GDPR & Privacidad Absoluta:** Cumplimiento de la política *Zero-Image*. Ningún flujo de video ni fotografía se almacena ni se transmite al servidor; únicamente viajan vectores numéricos de telemetría y puntuación RULA.
- **Consentimiento Digital Previo:** Gating estricto posterior al inicio de sesión con registro legal firmado digitalmente (IP, timestamp y versión de términos).

### 2. Supervisión de Conducta y Detección Anti-Fraude
- **Biometría Facial con Face Landmarker:** Detección automática de ausencia de postulante/empleado y alerta inmediata ante la presencia de terceras personas en encuadre.
- **Detección de Celular y Desvíos de Mirada:** Cálculo de orientación de cabeza (yaw/pitch) para alertar desvíos persistentes de atención y posturas anómalas de uso de dispositivos móviles.
- **Telemetría de Navegador:** Detección de pérdida de foco, cambio de pestañas (`Alt+Tab`), bloqueos a atajos de teclado y medición de dedicación activa frente a pantalla.

### 3. Consola de Supervisión en Tiempo Real (WebSockets)
- **Mosaico Semafórico Dinámico:** Panel centralizado para supervisores con tarjetas en vivo de cada sesión activa, con actualización instantánea de estado (Verde / Amarillo / Rojo).
- **Línea de Tiempo de Incidentes:** Feed cronológico de anomalías y alertas en tiempo real.
- **Modo Entrevista Interactiva:** Disparo de preguntas dinámicas y captura de respuestas estructuradas en vivo.

### 4. Inteligencia de Datos y Correlación Multidimensional
- **Motor de Correlación:** Algoritmo que cruza índices de fatiga postural con eventos de distracción y estrés para determinar el nivel de riesgo consolidado del colaborador.
- **Reportes Ejecutivos:** Exportación de analíticas y métricas para departamentos de Seguridad y Salud en el Trabajo (SST), Recursos Humanos y Gerencia.

### 5. Bitácora Inmutable WORM (Integridad Criptográfica)
- **Registro Inalterable (*Write Once, Read Many*):** Arquitectura de trazabilidad para auditorías forenses y legales.
- **Encadenamiento Criptográfico SHA-256:** Cada evento registrado sella el hash del bloque anterior (estilo ledger inmutable), impidiendo modificaciones retroactivas o eliminaciones arbitrarias.

---

## 🏗️ Arquitectura del Sistema

```
                      ┌────────────────────────────────────────┐
                      │          Navegador del Cliente         │
                      │  (React 19 + Vite + Tailwind CSS)     │
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┴────────────────────────┐
                 ▼                                                ▼
     [Edge AI - MediaPipe]                                [Eventos & Control]
  • Pose Landmarks (RULA)                              • Focus / Blur / Alt+Tab
  • Face Landmarker (Mirada / Celular)                 • Consentimiento Digital
                 │                                                │
                 └───────────────────────┬────────────────────────┘
                                         │ REST API / WebSocket
                                         ▼
                      ┌────────────────────────────────────────┐
                      │          Backend NestJS                │
                      │  (Controladores, Gateways, Servicios)  │
                      └───────┬────────────────────────┬───────┘
                              │                        │
                 ┌────────────┴───────────┐            │
                 ▼                        ▼            ▼
     [Motor de Correlación]       [Bitácora WORM]   [Swagger Docs]
     • Fatiga x Conducta          • SHA-256 Chain   • /api/docs
                 │                        │
                 └────────────┬───────────┘
                              ▼
                      ┌────────────────────────────────────────┐
                      │        PostgreSQL + Prisma ORM         │
                      │  (Multi-tenant con Aislamiento Estricto)│
                      └────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, MediaPipe Vision |
| **Backend** | NestJS, TypeScript, WebSocket (Socket.IO), Passport JWT, Bcrypt |
| **Base de Datos** | PostgreSQL, Prisma ORM |
| **Seguridad** | Cifrado SHA-256 (Bitácora WORM), Guards de Autorización RBAC, ConsentGuard |
| **Documentación** | Swagger / OpenAPI 3.0 |

---

## 🚀 Puesta en Marcha (Instalación Rápida)

### Requisitos Previos
- **Node.js**: v18.0.0 o superior
- **PostgreSQL**: Base de datos activa
- **NPM** o gestor de paquetes preferido

### 1. Clonar el Repositorio
```bash
git clone https://github.com/marcolop450/SW_Proyecto_Final.git
cd SW_Proyecto_Final
```

### 2. Configurar y Ejecutar el Backend
```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno (ajustar DATABASE_URL en .env)
# Ejemplo: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ergocheck_db?schema=public"

# Aplicar migraciones y cargar datos de prueba (Seeds)
npx prisma migrate deploy
npx prisma db seed

# Iniciar servidor en modo desarrollo
npm run start:dev
```
* **API Base:** `http://localhost:3000/api`
* **Swagger Docs:** `http://localhost:3000/api/docs`

### 3. Configurar y Ejecutar el Frontend
```bash
# En una nueva terminal, situarse en la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar aplicación web
npm run dev
```
* **Aplicación Web:** `http://localhost:5173`

---

## 👥 Cuentas de Demostración (Seed Data)

Todas las cuentas de prueba comparten la contraseña maestra: **`12345`**

| Rol del Usuario | Correo Electrónico | Módulos y Funciones Disponibles |
| :--- | :--- | :--- |
| **Super Administrador** | `manuela@gmail.com` | Consola Financiera SaaS, Ingresos Globales, MRR y Clientes de Pago. |
| **Admin Organización** | `carlos.mendoza@visitask.com` | Gestión de Departamentos, Usuarios y Facturación de la Empresa. |
| **Supervisor SST** | `jairo.camacho@visitask.com` | Mosaico Semafórico en Vivo (WebSockets) y Línea de Tiempo de Incidentes. |
| **Evaluador Técnico** | `marco.lopez@visitask.com` | Banco de Cuestionarios, Evaluaciones y Preguntas en Vivo. |
| **Empleado / Teletrabajo** | `juan.matienzo@visitask.com` | Mi Ergonomía, Sesiones Biomecánicas RULA en Vivo (Edge AI). |
| **Postulante** | `candidato.demo@gmail.com` | Portal de Evaluaciones y Examen Supervisado Anti-Fraude. |

---

## 🧪 Pruebas Automatizadas de QA

El proyecto cuenta con suites de pruebas automatizadas para verificar integridad de endpoints y reglas de negocio:

```bash
cd backend

# Ejecutar pruebas de Supervisión de Conducta (Sprint 3)
node test/qa-sprint3-supervision.js

# Ejecutar pruebas del Motor de Correlación, Reportes y Bitácora WORM (Sprint 4)
node test/qa-sprint4-correlacion-reportes.js
```

---

## 📜 Licencia y Propiedad
Proyecto desarrollado bajo estrictos estándares de ingeniería de software, arquitectura modular limpia y principios DevSecOps.
