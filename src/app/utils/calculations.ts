// Automatic calculations for Casa Musical

import { Alumno, Profesor, Gasto, DashboardMetrics } from './types';

export function calculateTotalIngresos(alumnos: Alumno[]): number {
  return alumnos.reduce((sum, a) => sum + (a.aporte || 0), 0);
}

export function calculateTotalGastos(gastos: Gasto[]): number {
  return gastos.reduce((sum, g) => sum + (g.monto || 0), 0);
}

export function calculateFlujoCaja(ingresos: number, gastos: number): number {
  return ingresos - gastos;
}

export function calculateUtilidad(ingresos: number, gastos: number): number {
  return ingresos - gastos;
}

export function calculateUtilityPercentage(utilidad: number, ingresos: number): number {
  return ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
}

export function calculateCostPerProfesor(totalGastos: number, profesores: Profesor[]): number {
  return profesores.length > 0 ? totalGastos / profesores.length : 0;
}

export function calculateOccupationRate(alumnos: Alumno[], maxCapacity: number = 50): number {
  return (alumnos.length / maxCapacity) * 100;
}

export function calculateStudentsWithPendingPayment(alumnos: Alumno[]): number {
  return alumnos.filter(a => !a.pagado).length;
}

export function getDashboardMetrics(
  alumnos: Alumno[],
  profesores: Profesor[],
  gastos: Gasto[],
  maxCapacity: number = 50
): DashboardMetrics {
  const ingresos = calculateTotalIngresos(alumnos);
  const totalGastos = calculateTotalGastos(gastos);

  return {
    totalAlumnos: alumnos.length,
    totalProfesores: profesores.length,
    ingresosMensuales: ingresos,
    gastosMensuales: totalGastos,
    flujoCaja: calculateFlujoCaja(ingresos, totalGastos),
    alumnosConPagoPendiente: calculateStudentsWithPendingPayment(alumnos),
    utilidad: calculateUtilidad(ingresos, totalGastos),
    tasaOcupacion: calculateOccupationRate(alumnos, maxCapacity),
  };
}
