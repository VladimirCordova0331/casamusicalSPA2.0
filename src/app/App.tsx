import { useState, useEffect, useMemo } from 'react';
import {
  Sun, Moon, Music, Users, Wallet, BarChart3,
  FileText, Package, Star, Menu, X, BookOpen,
} from 'lucide-react';
import { Dashboard } from './components/modules/dashboard/Dashboard';
import { StudentModule } from './components/modules/students/StudentModule';
import { TeacherModule } from './components/modules/teachers/TeacherModule';
import { FinanceModule } from './components/modules/finances/FinanceModule';
import { InventoryModule } from './components/modules/inventory/InventoryModule';
import { GrowthModule } from './components/modules/growth/GrowthModule';
import { DocumentsModule } from './components/modules/documents/DocumentsModule';
import { load, save } from './utils/storage';
import { 
  Alumno, Profesor, Gasto, InventarioItem, 
  GrupoFamiliar, SmartAlert
} from './utils/types';
import { getDashboardMetrics } from './utils/calculations';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: BarChart3 },
  { id: 'alumnos', label: 'Alumnos', Icon: Users },
  { id: 'profesores', label: 'Profesores', Icon: BookOpen },
  { id: 'finanzas', label: 'Finanzas', Icon: Wallet },
  { id: 'inventario', label: 'Inventario', Icon: Package },
  { id: 'crecimiento', label: 'Crecimiento', Icon: Star },
  { id: 'documentos', label: 'Documentos', Icon: FileText },
] as const;

export default function App() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const [tab, setTab] = useState<typeof TABS[number]['id']>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [alumnos, setAlumnos] = useState<Alumno[]>(() => load('cm_alumnos', []));
  const [profesores, setProfesores] = useState<Profesor[]>(() => load('cm_profesores', []));
  const [grupos, setGrupos] = useState<GrupoFamiliar[]>(() => load('cm_grupos', []));
  const [gastos, setGastos] = useState<Gasto[]>(() => load('cm_gastos', []));
  const [inventario, setInventario] = useState<InventarioItem[]>(() => load('cm_inventario', []));

  const [toast, setToast] = useState({ show: false, msg: '' });
  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 2400);
  };

  useEffect(() => { save('cm_alumnos', alumnos); }, [alumnos]);
  useEffect(() => { save('cm_profesores', profesores); }, [profesores]);
  useEffect(() => { save('cm_grupos', grupos); }, [grupos]);
  useEffect(() => { save('cm_gastos', gastos); }, [gastos]);
  useEffect(() => { save('cm_inventario', inventario); }, [inventario]);

  const metrics = useMemo(() => 
    getDashboardMetrics(alumnos, profesores, gastos),
    [alumnos, profesores, gastos]
  );

  const smartAlerts = useMemo(() => {
    const alerts: SmartAlert[] = [];
    
    if (gastos.length > 0) {
      const avgGasto = gastos.reduce((s, g) => s + g.monto, 0) / gastos.length;
      const highGastos = gastos.filter(g => g.monto > avgGasto * 1.5);
      if (highGastos.length > 0) {
        alerts.push({
          id: 'high-expenses',
          type: 'warning',
          title: 'Gastos Elevados Detectados',
          message: `${highGastos.length} gasto(s) está(n) por encima del promedio`,
          timestamp: Date.now(),
        });
      }
    }

    if (metrics.alumnosConPagoPendiente > 0) {
      alerts.push({
        id: 'pending-payments',
        type: 'alert',
        title: 'Pagos Pendientes',
        message: `${metrics.alumnosConPagoPendiente} familia(s) tiene(n) pago pendiente`,
        timestamp: Date.now(),
      });
    }

    if (metrics.tasaOcupacion > 80) {
      alerts.push({
        id: 'high-occupancy',
        type: 'info',
        title: 'Alta Ocupación',
        message: `Estás al ${metrics.tasaOcupacion.toFixed(0)}% de capacidad`,
        timestamp: Date.now(),
      });
    }

    return alerts;
  }, [gastos, metrics]);

  const monthlyData = [
    { month: 'Ene', ingresos: 1200000, gastos: 800000 },
    { month: 'Feb', ingresos: 1350000, gastos: 820000 },
    { month: 'Mar', ingresos: 1500000, gastos: 900000 },
  ];

  const handleAddAlumno = (newAlumno: Omit<Alumno, 'id' | 'clases'>) => {
    const id = Math.max(...alumnos.map(a => a.id), 0) + 1;
    setAlumnos([...alumnos, { ...newAlumno, id, clases: [] }]);
    showToast(`✓ ${newAlumno.nombre} agregado`);
  };

  const handleDeleteAlumno = (id: number) => {
    setAlumnos(alumnos.filter(a => a.id !== id));
    showToast(`✓ Alumno eliminado`);
  };

  const handleEditAlumno = (id: number, updates: Partial<Alumno>) => {
    setAlumnos(alumnos.map(a => a.id === id ? { ...a, ...updates } : a));
    showToast('✓ Alumno actualizado');
  };

  const handleAddGasto = (gasto: Omit<Gasto, 'id'>) => {
    const id = Math.max(...gastos.map(g => g.id), 0) + 1;
    setGastos([...gastos, { ...gasto, id }]);
    showToast(`✓ Gasto registrado`);
  };

  const handleDeleteGasto = (id: number) => {
    setGastos(gastos.filter(g => g.id !== id));
    showToast(`✓ Gasto eliminado`);
  };

  const handleAddProfessor = (prof: Omit<Profesor, 'id'>) => {
    const id = Math.max(...profesores.map(p => p.id), 0) + 1;
    setProfesores([...profesores, { ...prof, id }]);
    showToast(`✓ Profesor ${prof.nombre} agregado`);
  };

  const handleEditProfessor = (id: number, updates: Partial<Profesor>) => {
    setProfesores(profesores.map(p => p.id === id ? { ...p, ...updates } : p));
    showToast('✓ Profesor actualizado');
  };

  const handleDeleteProfessor = (id: number) => {
    setProfesores(profesores.filter(p => p.id !== id));
    showToast(`✓ Profesor eliminado`);
  };

  const handleAddInventoryItem = (item: Omit<InventarioItem, 'id'>) => {
    const id = Math.max(...inventario.map(i => i.id), 0) + 1;
    setInventario([...inventario, { ...item, id }]);
    showToast(`✓ Ítem agregado al inventario`);
  };

  const handleDeleteInventoryItem = (id: number) => {
    setInventario(inventario.filter(i => i.id !== id));
    showToast(`✓ Ítem eliminado`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/casa-musical-logo.png" 
              alt="Casa Musical Academia" 
              className="w-10 h-10 object-contain"
            />
            <h1 className="font-bold hidden sm:inline text-lg">Casa Musical Academia</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="border-t border-border px-3 py-2 bg-card/50 overflow-x-auto">
            <div className="flex gap-1">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setTab(id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap rounded-lg transition-colors ${
                    tab === id
                      ? 'bg-accent/20 text-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden sm:flex border-b border-border bg-card px-3 sticky top-[57px] z-30 overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === id
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 py-4 pb-16">
        {tab === 'dashboard' && (
          <Dashboard metrics={metrics} alerts={smartAlerts} monthlyData={monthlyData} />
        )}

        {tab === 'alumnos' && (
          <StudentModule
            students={alumnos}
            professors={profesores.map(p => p.nombre)}
            onAdd={handleAddAlumno}
          onEdit={handleEditAlumno}
            onDelete={handleDeleteAlumno}
          />
        )}

        {tab === 'finanzas' && (
          <FinanceModule
            gastos={gastos}
            onAddGasto={handleAddGasto}
            onDeleteGasto={handleDeleteGasto}
          />
        )}

        {tab === 'profesores' && (
          <TeacherModule
            professors={profesores}
            onAddProfessor={handleAddProfessor}
            onEditProfessor={handleEditProfessor}
            onDeleteProfessor={handleDeleteProfessor}
          />
        )}

        {tab === 'inventario' && (
          <InventoryModule
            items={inventario}
            onAddItem={handleAddInventoryItem}
            onDeleteItem={handleDeleteInventoryItem}
          />
        )}

        {tab === 'crecimiento' && (
          <GrowthModule />
        )}

        {tab === 'documentos' && (
          <DocumentsModule />
        )}

        {!['dashboard', 'alumnos', 'finanzas', 'profesores', 'inventario', 'crecimiento', 'documentos'].includes(tab) && (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h2 className="text-lg font-semibold mb-2">Módulo en desarrollo</h2>
            <p className="text-muted-foreground text-sm">El módulo de {TABS.find(t => t.id === tab)?.label} está siendo optimizado.</p>
          </div>
        )}
      </main>

      {/* Toast */}
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-lg px-4 py-3 text-sm font-medium shadow-xl transition-all duration-300 ${
          toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        {toast.msg}
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm px-3 py-2 text-center text-xs text-muted-foreground">
        Casa Musical Academia SPA • Gestión inteligente para tu éxito
      </footer>
    </div>
  );
}
