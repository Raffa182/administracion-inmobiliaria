export const expenseLabels: Record<string, string> = {
  IBI: "IBI",
  BASURA: "Basura",
  ARREGLO: "Arreglo",
  COMUNIDAD: "Comunidad",
  SEGURO: "Seguro",
  OTRO: "Otro",
};

export const contractTypeLabels: Record<string, string> = {
  LARGA_TEMPORADA: "Larga temporada",
  TEMPORADA: "Temporada",
};

export const listingTypeLabels: Record<string, string> = {
  ALQUILER: "Alquiler",
  VENTA: "Venta",
  ALQUILER_Y_VENTA: "Alquiler y venta",
};

export const saleStatusLabels: Record<string, string> = {
  DISPONIBLE: "Disponible",
  RESERVADA: "Reservada",
  VENDIDA: "Vendida",
  CANCELADA: "Cancelada",
};

export const saleStatusStyles: Record<string, string> = {
  DISPONIBLE:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  RESERVADA:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  VENDIDA:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  CANCELADA:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
};

export const reservationStatusLabels: Record<string, string> = {
  ACTIVA: "Activa",
  CONVERTIDA: "Convertida en contrato",
  CANCELADA: "Cancelada",
};

export const reservationStatusStyles: Record<string, string> = {
  ACTIVA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CONVERTIDA: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELADA: "bg-red-50 text-red-700 border-red-200",
};

export const personDocumentLabels: Record<string, string> = {
  DNI: "DNI",
  NOMINA: "Nómina",
  CONTRATO_TRABAJO: "Contrato de trabajo",
  OTRO: "Otro",
};

export const propertyDocumentLabels: Record<string, string> = {
  ESCRITURA: "Escritura",
  OTRO: "Otro",
};

export const contractStatusStyles: Record<string, string> = {
  ACTIVO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FINALIZADO: "bg-slate-100 text-slate-600 border-slate-200",
  RESCINDIDO: "bg-red-50 text-red-700 border-red-200",
};
