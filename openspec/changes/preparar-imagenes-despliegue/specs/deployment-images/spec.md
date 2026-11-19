## ADDED Requirements

### Requirement: Imágenes de aplicación verificadas
El proyecto SHALL construir las imágenes del frontend y del backend usando Node 24 LTS y los archivos de bloqueo existentes.

#### Scenario: Construcción de las aplicaciones
- **WHEN** se construyen ambas imágenes con Docker
- **THEN** ambas compilaciones terminan correctamente y la API conserva su cliente Prisma generado.

### Requirement: Configuración privada en ejecución
Los contextos Docker SHALL excluir los archivos .env y sus variantes.

#### Scenario: Construcción con variables locales presentes
- **WHEN** el proyecto contiene archivos de entorno locales
- **THEN** las imágenes se construyen y las credenciales se proporcionan durante la ejecución.

### Requirement: Compatibilidad de ejecución
Las imágenes SHALL conservar las rutas de la API, el proxy Nginx y las rutas del frontend.

#### Scenario: Inicio de los contenedores
- **WHEN** las imágenes se inician con las variables y la red necesarias
- **THEN** la API ejecuta consultas Prisma y el frontend entrega su página y las rutas de React.
