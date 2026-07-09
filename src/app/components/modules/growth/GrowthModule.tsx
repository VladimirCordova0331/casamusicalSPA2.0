import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

interface GrowthData {
  month: string;
  alumnos: number;
  ingresos: number;
  ocupacion: number;
}

interface GrowthModuleProps {
  data?: GrowthData[];
}

export function GrowthModule({ data = [] }: GrowthModuleProps) {
  // Demo data para visualización
  const defaultData = [
    { month: 'Ene', alumnos: 8, ingresos: 800000, ocupacion: 16 },
    { month: 'Feb', alumnos: 12, ingresos: 1200000, ocupacion: 24 },
    { month: 'Mar', alumnos: 18, ingresos: 1800000, ocupacion: 36 },
    { month: 'Abr', alumnos: 22, ingresos: 2200000, ocupacion: 44 },
    { month: 'May', alumnos: 28, ingresos: 2800000, ocupacion: 56 },
    { month: 'Jun', alumnos: 32, ingresos: 3200000, ocupacion: 64 },
  ];

  const displayData = data.length > 0 ? data : defaultData;

  const latestMonth = displayData[displayData.length - 1];
  const previousMonth = displayData[displayData.length - 2];

  const alumnosGrowth = previousMonth 
    ? ((latestMonth.alumnos - previousMonth.alumnos) / previousMonth.alumnos * 100).toFixed(1)
    : 0;

  const ingresosGrowth = previousMonth
    ? ((latestMonth.ingresos - previousMonth.ingresos) / previousMonth.ingresos * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-4">
      {/* KPIs de Crecimiento */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Alumnos Actuales</p>
          <p className="text-2xl font-bold text-foreground">{latestMonth.alumnos}</p>
          <p className="text-xs text-green-500 mt-1">+{alumnosGrowth}% mes anterior</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Ingresos</p>
          <p className="text-2xl font-bold text-green-500">${(latestMonth.ingresos / 1000).toFixed(0)}K</p>
          <p className="text-xs text-green-500 mt-1">+{ingresosGrowth}% mes anterior</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Ocupación</p>
          <p className="text-2xl font-bold text-accent">{latestMonth.ocupacion}%</p>
          <p className="text-xs text-muted-foreground mt-1">de capacidad</p>
        </div>
      </div>

      {/* Gráfico de Crecimiento */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Tendencia de Crecimiento</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="alumnos" 
              stroke="#3b82f6" 
              name="Alumnos"
              dot={{ fill: '#3b82f6', r: 4 }}
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="ocupacion" 
              stroke="#10b981" 
              name="Ocupación (%)"
              dot={{ fill: '#10b981', r: 4 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Insights de Crecimiento</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm font-medium text-green-500">📈 Crecimiento Positivo</p>
            <p className="text-xs text-muted-foreground mt-1">
              Casa Musical ha crecido {alumnosGrowth}% en alumnos en el último mes. ¡Excelente desempeño!
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm font-medium text-blue-500">💰 Ingresos en Aumento</p>
            <p className="text-xs text-muted-foreground mt-1">
              Los ingresos crecieron {ingresosGrowth}% respecto al mes anterior, correlacionado con más alumnos.
            </p>
          </div>
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm font-medium text-yellow-500">⚠️ Capacidad</p>
            <p className="text-xs text-muted-foreground mt-1">
              Actualmente estás al {latestMonth.ocupacion}% de capacidad. Considera expandir si superas 80%.
            </p>
          </div>
        </div>
      </div>

      {/* Proyección */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Proyección del Próximo Mes</h3>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Proyección de Alumnos</p>
            <p className="text-lg font-bold text-foreground">
              ≈ {Math.round(latestMonth.alumnos * 1.15)} alumnos
            </p>
            <p className="text-xs text-green-500">+15% estimado</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 mt-3">Proyección de Ingresos</p>
            <p className="text-lg font-bold text-green-500">
              ${(latestMonth.ingresos * 1.15 / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-green-500">+15% estimado</p>
          </div>
        </div>
      </div>
    </div>
  );
}
