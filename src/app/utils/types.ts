// Core types for Casa Musical App

export interface Clase {
  fecha: string;
  contenido: string;
}

export interface Alumno {
  id: number;
  nombre: string;
  apoderado: string;
  instrumento: string;
  profesor: string;
  aporte: number;
  modalidad: string;
  grupoFamiliar: boolean;
  clases: Clase[];
  pagado?: boolean;
}

export interface Profesor {
  id: number;
  nombre: string;
  especialidad: string;
  valorHora: number;
}

export interface Gasto {
  id: number;
  concepto: string;
  categoria: string;
  monto: number;
  fecha: string;
  automatico: boolean;
}

export interface InventarioItem {
  id: number;
  nombre: string;
  categoria: string;
  cantidad: number;
  estado: 'bueno' | 'regular' | 'malo';
  ubicacion: string;
}

export interface Compra {
  id: number;
  nombre: string;
  prioridad: 'alta' | 'media' | 'baja';
  nota: string;
}

export interface GrupoFamiliar {
  id: number;
  nombre: string;
  miembros: number[];
  descuento: number;
}

// Dashboard metrics
export interface DashboardMetrics {
  totalAlumnos: number;
  totalProfesores: number;
  ingresosMensuales: number;
  gastosMensuales: number;
  flujoCaja: number;
  alumnosConPagoPendiente: number;
  utilidad: number;
  tasaOcupacion: number;
}

// Alerts for smart system
export interface SmartAlert {
  id: string;
  type: 'info' | 'warning' | 'alert';
  title: string;
  message: string;
  timestamp: number;
}

// Document type for Documents module
export interface Documento {
  id: number;
  nombre: string;
  tipo: 'contrato' | 'recibo' | 'factura' | 'reporte' | 'acuerdo' | 'otro';
  fecha: string;
  descripcion: string;
}

// Monthly growth snapshot for Growth module
export interface GrowthSnapshot {
  month: string;
  alumnos: number;
  ingresos: number;
  gastos: number;
}
