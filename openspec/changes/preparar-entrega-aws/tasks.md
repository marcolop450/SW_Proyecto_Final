## 1. Entrega

- [x] 1.1 Preparar la guía y registrar las versiones y comprobaciones pendientes.
- [x] 1.2 Reproducir en una copia limpia el arranque y las comprobaciones de HTTPS.
- [ ] 1.3 Registrar una reproducción en el equipo de otro integrante.

## 2. Propuesta de AWS

- [x] 2.1 Comparar Lightsail y EC2 y verificar el plan gratuito y la cobertura del crédito.
- [x] 2.2 Documentar la secuencia de despliegue, validación y retirada.
- [ ] 2.3 Acordar con el equipo DNS, responsables, presupuesto y tiempo de la demo.

## Resultados

El 19 de noviembre de 2026 se construyeron e iniciaron las imágenes del commit `c6f62f4` desde un clon limpio de GitHub. Pasaron las comprobaciones HTTPS del frontend, proceso y PostgreSQL, así como una parada y un nuevo arranque. Se probó también la exportación e importación de las dos imágenes con sus identificadores intactos. El clon temporal se quedó sin credenciales y se retiraron los contenedores de prueba. Confirmada en la consola de facturación la elegibilidad del crédito para Lightsail y EC2. Los compromisos del equipo y la aprobación de recursos quedan en el [plan para la demo](../../../docs/PLAN_INFRAESTRUCTURA_AWS.md).
