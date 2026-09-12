# Gestión Inmobiliaria

Plataforma web multi-cliente para inmobiliarias (adaptada al mercado
español): ficha completa de cada propiedad, reservas previas al contrato,
alquileres (larga temporada y temporada) con seguimiento de vencimientos y
actualizaciones de renta, ventas, documentación (DNI, nóminas, escrituras,
recibos de IBI/basura) y fotos (incluida la identificación de llaves), y
generación automática de recibos en PDF al registrar un pago.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS**
- **Prisma** + **SQLite** (fácilmente migrable a Postgres/MySQL en producción)
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
- `/registro` da de alta una inmobiliaria nueva (tenant) con su primer
  usuario admin.
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
- **Panel de plataforma** (`/admin`, rol `SUPERADMIN`): listado de todas las
  inmobiliarias con métricas básicas y activación/desactivación de cuentas.

## Desarrollo local

```bash
npm install
cp .env.example .env       # completar AUTH_SECRET con un valor propio
npx prisma migrate dev     # crea la base SQLite y corre el seed de demo
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
src/lib/receipt.ts           Generación del PDF de recibo (pdf-lib)
src/lib/labels.ts            Etiquetas compartidas para los enums del dominio
src/app/(auth)/              Login y registro
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

- Verificación de email real (magic link/OTP) antes de habilitar la cuenta.
- Storage externo (S3/Blob) para los contratos digitalizados y recibos en
  vez de guardarlos como base64 en la base (válido para el MVP, no para
  volúmenes grandes).
- Notificaciones automáticas de vencimiento de contrato y de actualización
  de alquiler próxima.
- Permisos más granulares dentro de `AGENTE` (hoy es todo-o-nada dentro del
  tenant); invitación por email en vez de alta directa con contraseña.
