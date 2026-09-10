# Gestión Inmobiliaria

Plataforma web multi-cliente para inmobiliarias: administración de alquileres,
seguimiento de vencimientos y actualizaciones de contrato, ABL y arreglos, y
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

## Funcionalidad

- **Dashboard de alquileres**: contratos activos, próximos a vencer (60
  días) y pagos pendientes, todo en una sola vista.
- **Detalle de contrato**: fecha de inicio/fin, próxima actualización del
  alquiler (con frecuencia configurable), contrato digitalizado (PDF/imagen
  subido por el usuario), ABL y arreglos, historial de pagos.
- **Recibo automático**: al marcar un pago como "Pagado" se genera al vuelo
  un PDF con los datos del recibo (inmobiliaria, propiedad, inquilino,
  período, monto, fecha) y queda disponible para descargar.

## Desarrollo local

```bash
npm install
cp .env.example .env       # completar AUTH_SECRET con un valor propio
npx prisma migrate dev     # crea la base SQLite y corre el seed de demo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

**Usuario de demo** (creado por el seed):

- Inmobiliaria: `demo`
- Email: `demo@inmobiliaria.com`
- Contraseña: `demo1234`

Para volver a cargar los datos de demo en cualquier momento:

```bash
npm run db:seed
```

## Estructura

```
prisma/schema.prisma        Modelo de datos (Tenant, User, Property, Renter,
                             Contract, Expense, Payment)
prisma/seed.ts               Datos de demo
src/lib/auth.ts              Configuración de Auth.js (Credentials)
src/lib/auth.config.ts       Config "edge-safe" reutilizada por el middleware
src/lib/receipt.ts           Generación del PDF de recibo (pdf-lib)
src/app/(auth)/              Login y registro
src/app/(dashboard)/         Dashboard y detalle/alta de contratos
src/app/api/                 Rutas API (contratos, gastos, pagos, recibos)
```

## Próximos pasos sugeridos

- Verificación de email real (magic link/OTP) antes de habilitar la cuenta.
- Storage externo (S3/Blob) para los contratos digitalizados y recibos en
  vez de guardarlos como base64 en la base (válido para el MVP, no para
  volúmenes grandes).
- Notificaciones automáticas de vencimiento de contrato y de actualización
  de alquiler próxima.
- Roles y permisos más granulares (hoy solo `ADMIN`/`AGENTE`).
