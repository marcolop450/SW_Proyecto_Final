# Plan para publicar la demo en AWS

Propuesta revisada el 19 de noviembre de 2026. Usar una instancia **Amazon Lightsail Ubuntu 24.04 LTS x86-64, 2 GB de RAM, 60 GB SSD y IPv4 pública** en **Oregón (`us-west-2`)** si está disponible el paquete. Mantiene la VM cerca de la región del pooler de Supabase, que seguirá alojando PostgreSQL. La VM ejecutará las imágenes ya construidas en un equipo del proyecto. Dos GB es un punto de partida para una demo y se debe validar en la VM con `docker stats` y `df -h`. [Paquetes de Lightsail](https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-bundles.html).

| Opción | Coste de referencia antes de créditos | Decisión |
| --- | --- | --- |
| Lightsail Linux 2 GB con IPv4 | USD 12 al mes, por horas hasta el máximo del paquete | Primera opción por almacenamiento incluido y coste previsible. |
| EC2 `t3.small` con 25 GB gp3 e IPv4 | Aproximadamente USD 21 al mes a 730 horas en un ejemplo con USD 0,0209/h de cómputo, USD 0,005/h de IPv4 y USD 0,08/GB-mes de disco | Alternativa si el paquete Lightsail no está disponible. Verificar la región y el precio reales antes de crearla. |

El ejemplo de EC2 excluye tráfico adicional, impuestos y posibles créditos de CPU de T3 Unlimited. La instancia `case-platform-server` pertenece a otro proyecto y queda separada de esta propuesta. [Precios de T3](https://aws.amazon.com/ec2/instance-types/t3/), [precios de IPv4](https://aws.amazon.com/vpc/pricing/), [precios EBS](https://aws.amazon.com/ebs/pricing/).

## Decisiones con el equipo antes de crear recursos

- [ ] Confirmar en **Facturación → Créditos** el saldo estimado, que el crédito sigue activo y que el paquete corresponde a Lightsail o EC2. El 19 de noviembre la consola mostró el plan gratuito activo y ambos servicios en la lista del crédito. El plan gratuito termina al agotarse el crédito o al llegar su fecha límite. La fecha de vencimiento del crédito y la del plan pueden diferir. [Preguntas frecuentes sobre el plan gratuito](https://aws.amazon.com/free/free-tier-faqs/).
- [ ] Acordar la duración de la demo y el máximo de créditos asignado. Propuesta inicial: siete días, hasta USD 4 en créditos para la VM. A precios de referencia, siete días de Lightsail de 12 USD/mes representan unos USD 2,80 si se prorratean sobre 30 días. Validar el coste en la consola y revisar el saldo durante la demo. Una alerta de AWS Budgets, si está disponible, sirve para avisar y no detiene los recursos.
- [ ] Elegir un subdominio que el equipo ya controle y designar a quien administra su DNS. Caddy emitirá TLS cuando el registro A apunte a la IP pública y los puertos TCP 80 y 443 estén accesibles. [Requisitos de HTTPS automático](https://caddyserver.com/docs/automatic-https).
- [ ] Acordar responsable y respaldo para AWS, DNS, Supabase y GitHub. Usar cuentas y claves SSH individuales, y entregar secretos solo a quienes operen la VM. Conservar el plan gratuito y el objetivo de cero desembolso.
- [ ] Elegir un proyecto Supabase aislado con cuentas y datos sintéticos para la demo. Reservar las pruebas destructivas y las semillas para PostgreSQL desechable. Antes de usar datos reales de varias organizaciones, verificar el [aislamiento de la bitácora](GUIA_ENTREGA_DESPLIEGUE.md#registro-de-entrega).

## Secuencia de despliegue, cuando se apruebe la propuesta

1. Crear la VM con **OS Only → Ubuntu 24.04** y el paquete elegido. Asociar una IP estática. En el firewall, permitir TCP 80 y 443, y limitar SSH a la IP de quien hará la instalación o a la opción de SSH de la consola que el equipo elija. Mantener los puertos de la API y PostgreSQL fuera de la entrada pública. [Firewall de Lightsail](https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-firewall-and-port-mappings-in-amazon-lightsail.html).
2. Crear el registro DNS A del subdominio y comprobar que resuelve a la IP de la VM. Instalar Docker Engine y el complemento Docker Compose en Ubuntu siguiendo la documentación oficial. [Docker Engine en Ubuntu](https://docs.docker.com/engine/install/ubuntu/).
3. Construir las imágenes en un equipo con Docker siguiendo la [guía local](GUIA_ENTREGA_DESPLIEGUE.md). Usar como etiqueta el commit aprobado, por ejemplo `c6f62f4`. Validar que ambas imágenes son `linux/amd64` con `docker image inspect --format '{{.Os}}/{{.Architecture}}' ergocheck/backend:c6f62f4 ergocheck/frontend:c6f62f4`. Exportarlas con `docker save -o ergocheck-c6f62f4.tar ergocheck/backend:c6f62f4 ergocheck/frontend:c6f62f4`.
4. Transferir el archivo de imágenes por SSH y obtener en la VM una copia del commit de GitHub con permisos de lectura, o transferir por SSH un archivo creado con `git archive` desde el commit. En la VM, importar con `sudo docker load -i ergocheck-c6f62f4.tar`. Verificar ambas etiquetas y dejar espacio para la versión anterior.
5. Crear el archivo privado `.env.production` a partir de la plantilla, con `APP_DOMAIN` igual al subdominio, `BIND_ADDRESS=0.0.0.0`, la etiqueta aprobada y credenciales privadas. En Linux, aplicar `chmod 600 .env.production`. Conservar las variables en el directorio del despliegue, fuera de Git.
6. Desde la raíz de la copia del commit, validar y arrancar con las imágenes importadas.

```bash
sudo docker compose --env-file .env.production -f compose.production.yml config --quiet
sudo docker compose --env-file .env.production -f compose.production.yml pull caddy
sudo docker compose --env-file .env.production -f compose.production.yml up -d --no-build --wait --wait-timeout 90
sudo docker compose --env-file .env.production -f compose.production.yml ps
```

7. Desde otra conexión, abrir la URL HTTPS pública y verificar redirección desde HTTP, validez TLS, navegación, `/api/health/live` y `/api/health/ready`. Validar ingreso, consentimiento, cámara física, WebSocket y reportes con cuentas de demostración. Registrar memoria, espacio, coste estimado y fecha prevista de retirada.
8. Ante un fallo, usar la versión anterior según la [guía de recuperación](GUIA_ENTREGA_DESPLIEGUE.md#actualizar-y-volver-a-la-versión-anterior). Cuando termine la demo, retirar los recursos creados para ella, incluyendo IP y recursos adicionales si existen. Detener Lightsail conserva la facturación de la instancia. Revisar Facturación después de retirar los recursos. [Facturación y eliminación en Lightsail](https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-frequently-asked-questions-faq-billing-and-account-management.html).
