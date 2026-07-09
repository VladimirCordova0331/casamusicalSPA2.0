import React from 'react';
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  Users, DollarSign, PieChart as PieChartIcon,
} from 'lucide-react';
import { DashboardMetrics, SmartAlert } from '../../../utils/types';

interface DashboardProps {
  metrics: DashboardMetrics;
  alerts: SmartAlert[];
  monthlyData: Array<{ month: string; ingresos: number; gastos: number }>;
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

export function Dashboard({ metrics, alerts, monthlyData }: DashboardProps) {
  const utilityPercentage = metrics.ingresosMensuales > 0
    ? ((metrics.utilidad / metrics.ingresosMensuales) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-4">
      {/* Main KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Ingresos"
          value={`$${(metrics.ingresosMensuales / 1000).toFixed(0)}K`}
          change="+12% vs mes anterior"
          icon={<DollarSign className="w-4 h-4" />}
          trend="up"
        />
        <MetricCard
          label="Gastos"
          value={`$${(metrics.gastosMensuales / 1000).toFixed(0)}K`}
          change="+5% vs mes anterior"
          icon={<DollarSign className="w-4 h-4" />}
          trend="up"
        />
        <MetricCard
          label="Utilidad"
          value={`$${(metrics.utilidad / 1000).toFixed(0)}K`}
          change={`${utilityPercentage}% de margen`}
          icon={<TrendingUp className="w-4 h-4" />}
          trend={metrics.utilidad > 0 ? 'up' : 'down'}
        />
        <MetricCard
          label="Alumnos"
          value={metrics.totalAlumnos.toString()}
          change={`${metrics.tasaOcupacion.toFixed(0)}% ocupación`}
          icon={<Users className="w-4 h-4" />}
          trend="neutral"
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

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Income vs Expenses */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold mb-3 text-foreground">Flujo Mensual</h4>
          <ResponsiveContainer width="100%" height={200}>
            <ReBarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                formatter={(value: any) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Bar dataKey="ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
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
            ${(metrics.flujoCaja / 1000).toFixed(0)}K
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
