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
    "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  RESERVADA:
    "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  VENDIDA:
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
  CANCELADA:
    "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
};

export const reservationStatusLabels: Record<string, string> = {
  ACTIVA: "Activa",
  CONVERTIDA: "Convertida en contrato",
  CANCELADA: "Cancelada",
};

export const reservationStatusStyles: Record<string, string> = {
  ACTIVA: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  CONVERTIDA: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
  CANCELADA: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
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
  ACTIVO: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  FINALIZADO: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
  RESCINDIDO: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
};
