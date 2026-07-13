import React from 'react';
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertCircle,
  Users, DollarSign,
} from 'lucide-react';
import { DashboardMetrics, SmartAlert } from '../../../utils/types';
import { BUSINESS_CONFIG } from '../../../config/business';

interface DashboardProps {
  metrics: DashboardMetrics;
  alerts: SmartAlert[];
  monthlyData: Array<{ month: string; ingresos: number; gastos: number }>;
  agendaFinance: {
    monthLabel: string;
    weeksInCalendar: number;
    extraWeeks: number;
    totalExtraPotential: number;
    coveredStudents: number;
    rows: Array<{
      id: number;
      nombre: string;
      aporte: number;
      valorClaseBase: number;
      clasesMesActual: number;
      clasesBase: number;
      clasesExtraPotenciales: number;
      costoPotencialExtra: number;
    }>;
  };
}

const MetricCard = ({ 
  label, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up',
  color = 'accent'
}: {
  label: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}) => (
  <div className="bg-card border border-border rounded-xl p-4 hover:border-accent/50 transition-colors">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <div className="text-accent">{Icon}</div>
    </div>
    <div className="mb-2">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {change && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${
          trend === 'up' ? 'text-green-500/70' : trend === 'down' ? 'text-red-500/70' : 'text-muted-foreground'
        }`}>
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          <span>{change}</span>
        </div>
      )}
    </div>
  </div>
);

const AlertCard = ({ alert }: { alert: SmartAlert }) => {
  const bgColor = alert.type === 'alert' ? 'bg-red-500/10 border-red-500/30' :
                  alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-blue-500/10 border-blue-500/30';
  
  const iconColor = alert.type === 'alert' ? 'text-red-500' :
                    alert.type === 'warning' ? 'text-yellow-500' :
                    'text-blue-500';

  return (
    <div className={`${bgColor} border rounded-lg p-3`}>
      <div className="flex items-start gap-2">
        <AlertCircle className={`w-4 h-4 ${iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{alert.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
        </div>
      </div>
    </div>
  );
};

export function Dashboard({ metrics, alerts, monthlyData, agendaFinance }: DashboardProps) {
  const utilityPercentage = metrics.ingresosMensuales > 0
    ? ((metrics.utilidad / metrics.ingresosMensuales) * 100).toFixed(1)
    : '0';

  const [hoveredBar, setHoveredBar] = React.useState<{ month: string; ingresos: number; gastos: number } | null>(null);

  return (
    <div className="space-y-4">
      {/* Main KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Ingresos"
          value={`$${metrics.ingresosMensuales.toLocaleString('es-CL')}`}
          change={metrics.ingresosMensuales > 0 ? 'Base mensual de alumnos' : 'Sin alumnos registrados'}
          icon={<DollarSign className="w-4 h-4" />}
          trend="neutral"
        />
        <MetricCard
          label="Gastos"
          value={`$${metrics.gastosMensuales.toLocaleString('es-CL')}`}
          change={metrics.gastosMensuales > 0 ? 'Total gastos registrados' : 'Sin gastos registrados'}
          icon={<DollarSign className="w-4 h-4" />}
          trend="neutral"
        />
        <MetricCard
          label="Utilidad"
          value={`$${metrics.utilidad.toLocaleString('es-CL')}`}
          change={`${utilityPercentage}% de margen`}
          icon={<TrendingUp className="w-4 h-4" />}
          trend={metrics.utilidad > 0 ? 'up' : 'down'}
        />
        <MetricCard
          label="Alumnos"
          value={metrics.totalAlumnos.toString()}
          change={metrics.alumnosConPagoPendiente > 0
            ? `${metrics.alumnosConPagoPendiente} con pago pendiente`
            : 'Todos al día con pagos'}
          icon={<Users className="w-4 h-4" />}
          trend={metrics.alumnosConPagoPendiente > 0 ? 'down' : 'up'}
        />
      </div>

      {/* Smart Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold">Alertas Inteligentes</h3>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Agenda y Finanzas (base {BUSINESS_CONFIG.monthlyBaseClasses} clases)</h3>
          <span className="text-xs text-muted-foreground capitalize">{agendaFinance.monthLabel}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <div className="bg-muted/40 rounded-lg p-2.5">
            <p className="text-[11px] text-muted-foreground">Semanas del mes</p>
            <p className="text-lg font-bold text-foreground">{agendaFinance.weeksInCalendar}</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-2.5">
            <p className="text-[11px] text-muted-foreground">Semanas extra</p>
            <p className={`text-lg font-bold ${agendaFinance.extraWeeks > 0 ? 'text-orange-500' : 'text-green-500'}`}>
              {agendaFinance.extraWeeks}
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg p-2.5">
            <p className="text-[11px] text-muted-foreground">Alumnos con 4+ clases</p>
            <p className="text-lg font-bold text-foreground">
              {agendaFinance.coveredStudents}/{agendaFinance.rows.length}
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg p-2.5">
            <p className="text-[11px] text-muted-foreground">Impacto potencial extra</p>
            <p className="text-lg font-bold text-orange-500">
              ${agendaFinance.totalExtraPotential.toLocaleString('es-CL')}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-2">
          Referencia financiera: cada alumno paga por 4 clases/mes. Si hay semana extra, este bloque muestra el costo potencial adicional.
        </p>

        <div className="space-y-1.5 max-h-44 overflow-y-auto">
          {agendaFinance.rows.length === 0 ? (
            <p className="text-xs text-muted-foreground">No hay alumnos para calcular agenda financiera.</p>
          ) : (
            agendaFinance.rows.slice(0, 8).map(row => (
              <div key={row.id} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{row.nombre}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {row.clasesMesActual}/{row.clasesBase} clases registradas • Clase base: ${row.valorClaseBase.toLocaleString('es-CL')}
                  </p>
                </div>
                <p className="text-xs font-semibold text-orange-500 ml-2">
                  +${row.costoPotencialExtra.toLocaleString('es-CL')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Income vs Expenses */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold mb-3 text-foreground">Flujo Mensual</h4>
          <ResponsiveContainer width="100%" height={200}>
            <ReBarChart
              data={monthlyData}
              onMouseMove={(state: any) => {
                if (state?.activePayload?.length > 0) {
                  setHoveredBar(state.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'currentColor' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${Number(v).toLocaleString('es-CL')}`} />
              <Bar dataKey="ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} cursor="default" background={{ fill: 'transparent' }} />
              <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} cursor="default" background={{ fill: 'transparent' }} />
            </ReBarChart>
          </ResponsiveContainer>
          {/* Tooltip debajo del gráfico */}
          <div className={`mt-2 rounded-lg px-3 py-2 border transition-all duration-150 ${hoveredBar ? 'opacity-100 border-border bg-muted/50' : 'opacity-0 border-transparent bg-transparent'}`} style={{ minHeight: '48px' }}>
            {hoveredBar && (
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="font-semibold text-foreground">{hoveredBar.month}</span>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    <span className="text-muted-foreground">Ingresos:</span>
                    <span className="font-semibold text-blue-400">${hoveredBar.ingresos.toLocaleString('es-CL')}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    <span className="text-muted-foreground">Gastos:</span>
                    <span className="font-semibold text-red-400">${hoveredBar.gastos.toLocaleString('es-CL')}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-muted-foreground">Resultado:</span>
                    <span className={`font-semibold ${hoveredBar.ingresos - hoveredBar.gastos >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${(hoveredBar.ingresos - hoveredBar.gastos).toLocaleString('es-CL')}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Occupation Rate */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold mb-3 text-foreground">Tasa de Ocupación</h4>
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <div className="text-4xl font-bold text-accent">
                {metrics.tasaOcupacion.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.totalAlumnos} de 50 alumnos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Flujo de Caja</p>
          <p className={`text-xl font-bold ${metrics.flujoCaja > 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${metrics.flujoCaja.toLocaleString('es-CL')}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Pagos Pendientes</p>
          <p className={`text-xl font-bold ${metrics.alumnosConPagoPendiente > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
            {metrics.alumnosConPagoPendiente}
          </p>
        </div>
      </div>
    </div>
  );
}
