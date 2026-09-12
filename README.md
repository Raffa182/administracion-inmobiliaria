# Gestión Inmobiliaria

Plataforma web multi-cliente para inmobiliarias (adaptada al mercado
español): ficha completa de cada propiedad, reservas previas al contrato,
alquileres (larga temporada y temporada) con seguimiento de vencimientos y
actualizaciones de renta, ventas, documentación (DNI, nóminas, escrituras,
recibos de IBI/basura) y fotos (incluida la identificación de llaves), y
generación automática de recibos en PDF al registrar un pago.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS**
- **Prisma** + **PostgreSQL**
- **Auth.js (NextAuth v5)** con Credentials — login por email + contraseña
- **pdf-lib** para la generación de los recibos de pago

## Multi-tenancy

Cada inmobiliaria (`Tenant`) tiene sus propios usuarios, propiedades,
inquilinos, contratos, gastos y pagos. El aislamiento es **lógico**: todas las
tablas tienen `tenantId` y cada consulta lo filtra explícitamente (ver
`src/lib/auth.ts` y las rutas en `src/app/api/**`).

- El login pide **inmobiliaria (slug) + email + contraseña**: el email solo
  es único *dentro* de cada inmobiliaria, así que dos clientes distintos
  pueden tener usuarios con el mismo email sin pisarse.
- No hay alta pública de inmobiliarias a propósito: solo el `SUPERADMIN`
  puede crear una, desde `/admin/nueva`. Si el registro fuera público,
  cualquiera con el link podría usar el servicio sin pasar por la
  inmobiliaria (y sin pagar).
- Para escalar a **bases de datos físicas separadas por cliente** (lo
  habitual en instalaciones grandes), el siguiente paso natural es resolver
  el `DATABASE_URL` por tenant (por subdominio, por ejemplo) en
  `src/lib/prisma.ts`, sin tener que tocar el resto de la app.

### Validación de acceso

El MVP valida con email + contraseña (hasheada con bcrypt). El modelo `User`
ya tiene un campo `emailVerified` listo para sumar verificación por email
(magic link / OTP) conectando un proveedor de envío de mails (Resend,
SendGrid, etc.) al `EmailProvider` de Auth.js.

### Roles

- **ADMIN**: además de operar la inmobiliaria, gestiona el equipo
  (`/dashboard/equipo`: alta/baja de usuarios `ADMIN`/`AGENTE`) y la
  configuración (`/dashboard/configuracion`: logo de la inmobiliaria).
- **AGENTE**: acceso operativo normal, sin gestión de equipo ni configuración.
- **SUPERADMIN**: rol de plataforma, no pertenece a una inmobiliaria real.
  Al iniciar sesión se lo redirige a `/admin`, donde puede:
  - Ver todas las inmobiliarias con métricas básicas, y buscarlas por
    nombre/slug.
  - Activar/desactivar el acceso de una inmobiliaria (una desactivada no
    puede iniciar sesión).
  - Editar el nombre/slug de una inmobiliaria, o borrarla por completo
    (con todos sus datos; requiere escribir el slug para confirmar).
  - Dar de alta una inmobiliaria manualmente, con su primer usuario admin.
  - Editar el email o resetear la contraseña de cualquier usuario
    (soporte cuando el cliente se queda sin acceso o escribió mal el
    email al registrarse).
  - **Entrar como una inmobiliaria** ("impersonar"): toma la identidad de
    su primer usuario ADMIN para ver la app exactamente como la ve ese
    cliente. Un banner naranja indica que está en modo soporte y permite
    volver a `/admin` con un clic.
  - Ver el log de auditoría (`/admin/auditoria`) de todas estas acciones.

  Vive en un tenant dedicado (`plataforma`, creado por el seed) que solo
  existe para alojarlo.

## Funcionalidad

- **Propiedades**: ficha completa de cada inmueble (m², habitaciones,
  mascotas, electrodomésticos, amueblado, parking, urbanización, precio
  orientativo de alquiler/venta), fotos de la propiedad, fotos de llaves
  (para identificar cuál llave es de cuál propiedad), documentos
  (escritura, etc.) y el histórico de gastos, contratos y ventas
  vinculados. Las propiedades se cargan una sola vez y después se
  reutilizan desde reservas, contratos y ventas (o se crean nuevas al
  vuelo desde esos mismos formularios).
- **Reservas**: paso previo al contrato de alquiler, con la seña/honorarios
  acordados. Se pueden cancelar o convertir en un contrato (que hereda la
  propiedad y el inquilino de la reserva).
- **Dashboard de alquileres**: contratos activos, próximos a vencer (60
  días) y pagos pendientes, todo en una sola vista. Cada contrato indica
  si es de **larga temporada** o **temporada**.
- **Detalle de contrato**: fecha de inicio/fin, próxima actualización de la
  renta (revisión anual según IPC, frecuencia configurable), contrato
  digitalizado (PDF/imagen subido por el usuario), documentación del
  inquilino (DNI, nómina, contrato de trabajo), IBI/basura y arreglos,
  historial de pagos.
- **Recibo automático**: al marcar un pago como "Pagado" se genera al vuelo
  un PDF con los datos del recibo (inmobiliaria, propiedad, inquilino,
  período, monto, fecha) y queda disponible para descargar.
- **Ventas**: propiedad, comprador (opcional al crearla), precio y estado
  (disponible/reservada/vendida/cancelada), con la documentación de la
  propiedad (escritura, IBI, basura) y del comprador (DNI, nómina).
- **Importes en euros** y formato de fecha/número con la configuración
  regional española (`es-ES`).
- **Equipo**: cada inmobiliaria (rol `ADMIN`) puede dar de alta o eliminar
  usuarios (`ADMIN`/`AGENTE`) de su propio tenant.
- **Logo**: cada inmobiliaria puede subir su logo desde
  `/dashboard/configuracion`; se muestra en el encabezado del panel.
- **Panel de plataforma** (`/admin`, rol `SUPERADMIN`): estado del sistema,
  listado de todas las inmobiliarias con métricas básicas y
  activación/desactivación de cuentas.
- **Verificación en dos pasos** (`/admin/seguridad`, rol `SUPERADMIN`): TOTP
  (Google Authenticator, Authy, etc.) con códigos de respaldo de un solo uso.
  Opcional por ahora, solo para cuentas de super admin.
- **Notificaciones internas** (`/dashboard/notificaciones`): contratos por
  vencer, pagos vencidos/próximos y reservas activas hace más de 15 días,
  calculado al vuelo (sin email todavía).
- **Resumen de negocio** (`/dashboard/resumen`): cobrado por mes, ocupación
  y accesos directos a lo que necesita atención.
- **Portal del inquilino/comprador** (`/portal/entrar`): login sin
  contraseña por magic link enviado por email. El inquilino/comprador ve
  su contrato o su venta y el estado de sus pagos, sin llamar a la
  inmobiliaria. Requiere `APP_URL` configurado (ver más abajo) para que el
  link del email apunte al lugar correcto; sin SMTP configurado, el link
  se loguea en la consola del servidor en vez de enviarse por email.

## Desarrollo local

Requiere una instancia de PostgreSQL corriendo (local, Docker, o en otra
LXC — ver la sección de despliegue más abajo).

```bash
npm install
cp .env.example .env       # completar DATABASE_URL y AUTH_SECRET
npx prisma migrate dev     # crea el schema y corre el seed de demo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

**Usuarios de demo** (creados por el seed):

- Inmobiliaria: `demo` · Email: `demo@inmobiliaria.com` (ADMIN) · Contraseña: `demo1234`
- Inmobiliaria: `demo` · Email: `agente@inmobiliaria.com` (AGENTE) · Contraseña: `demo1234`
- Super admin: Inmobiliaria: `plataforma` · Email: `superadmin@plataforma.com` · Contraseña: `superadmin1234`

Para volver a cargar los datos de demo en cualquier momento:

```bash
npm run db:seed
```

## Despliegue: PostgreSQL en su propia LXC

En producción la base vive en una LXC separada de la app (más fácil de
respaldar, actualizar y escalar sin tocar el servidor web).

**1. Crear la LXC** (desde el host Proxmox):

```bash
pct create 201 local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst \
  --hostname db-inmobiliaria \
  --cores 2 --memory 2048 --swap 512 \
  --rootfs local-lvm:20 \
  --net0 name=eth0,bridge=vmbr0,ip=10.0.0.20/24,gw=10.0.0.1 \
  --unprivileged 1 --features nesting=1
pct start 201
```

Ajustar `ip`/`gw`/`bridge` a la red interna real donde también vive la LXC
de la app. **Postgres no necesita salir a internet ni ser alcanzable desde
afuera** — solo desde la LXC de la app.

**2. Instalar y configurar Postgres dentro de la LXC:**

```bash
pct exec 201 -- bash -c "
  apt update && apt install -y postgresql postgresql-contrib &&
  sudo -u postgres psql -c \"CREATE ROLE inmobiliaria WITH LOGIN PASSWORD 'CAMBIAR-ESTA-CLAVE';\" &&
  sudo -u postgres psql -c \"CREATE DATABASE inmobiliaria OWNER inmobiliaria;\"
"
```

Editar dentro de la LXC:

- `/etc/postgresql/*/main/postgresql.conf`: `listen_addresses = '10.0.0.20'`
  (la IP de esta LXC, no `*`).
- `/etc/postgresql/*/main/pg_hba.conf`: agregar una línea que solo permita
  la IP de la LXC de la app, por ejemplo:
  `host  inmobiliaria  inmobiliaria  10.0.0.10/32  scram-sha-256`

Reiniciar: `pct exec 201 -- systemctl restart postgresql`.

Si Proxmox tiene firewall activado, agregar una regla en la LXC de Postgres
que permita el puerto 5432 **solo** desde la IP de la LXC de la app, y
deniegue el resto.

**3. Migrar los datos existentes** (si ya hay una inmobiliaria real cargada
en el SQLite viejo):

```bash
# Desde la LXC de la app, con pgloader instalado:
pgloader /opt/administracion-inmobiliaria/prisma/dev.db \
  postgresql://inmobiliaria:CAMBIAR-ESTA-CLAVE@10.0.0.20/inmobiliaria
```

Si es una instalación nueva sin datos reales que conservar, se puede saltar
este paso y usar directamente `npx prisma migrate deploy` + `npm run db:seed`.

**4. Apuntar la app a la nueva base** (en la LXC de la app):

```bash
# En /opt/administracion-inmobiliaria/.env
DATABASE_URL="postgresql://inmobiliaria:CAMBIAR-ESTA-CLAVE@10.0.0.20:5432/inmobiliaria?schema=public"
```

```bash
cd /opt/administracion-inmobiliaria
npx prisma migrate deploy   # aplica el schema (no usar "migrate dev" en producción)
npm run build
# reiniciar el proceso de la app (pm2 restart, systemctl restart, etc.)
```

**Backups**: programar un `pg_dump` diario desde un cron en la LXC de
Postgres, comprimido y copiado fuera de esa misma LXC (otro disco, otro
host, o un bucket). Un backup que vive solo en la misma LXC que puede
corromperse no cuenta como backup.

## Estructura

```
prisma/schema.prisma        Modelo de datos (Tenant, User, Property, Renter,
                             Buyer, Contract, Reservation, Sale, Expense,
                             Payment, PersonDocument, PropertyDocument,
                             PropertyPhoto, AdminAuditLog)
prisma/seed.ts               Datos de demo
src/lib/auth.ts              Configuración de Auth.js (Credentials)
src/lib/auth.config.ts       Config "edge-safe" reutilizada por el middleware
src/lib/impersonation.ts     Firma manual del JWT de sesión para "entrar como"
src/lib/audit.ts             Registro de acciones del super admin
src/lib/two-factor.ts        TOTP y códigos de respaldo (verificación en dos pasos)
src/lib/receipt.ts           Generación del PDF de recibo (pdf-lib)
src/lib/labels.ts            Etiquetas compartidas para los enums del dominio
src/app/(auth)/              Login (sin registro público, ver Multi-tenancy)
src/app/(dashboard)/         Dashboard, propiedades, reservas, contratos,
                             ventas, equipo, configuración (logo)
src/app/(admin)/admin/       Panel de plataforma (SUPERADMIN): inmobiliarias,
                             alta manual, detalle/edición/borrado, auditoría
src/app/api/                 Rutas API (propiedades, reservas, contratos,
                             ventas, gastos, pagos, recibos, documentos,
                             fotos, usuarios, tenant/logo, admin/tenants,
                             admin/usuarios, admin/impersonar)
```

## Próximos pasos sugeridos

- Elegir proveedor SMTP y configurar `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`
  para que el link del portal y las futuras notificaciones por email
  salgan de verdad (hoy se loguean en la consola del servidor).
- Que el inquilino pueda subir el comprobante de su pago desde el portal
  (hoy es de solo lectura).
- Storage externo (S3/Blob) para los contratos digitalizados y recibos en
  vez de guardarlos como base64 en la base (válido para el MVP, no para
  volúmenes grandes).
- Permisos más granulares dentro de `AGENTE` (hoy es todo-o-nada dentro del
  tenant); invitación por email en vez de alta directa con contraseña.
