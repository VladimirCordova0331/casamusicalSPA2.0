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
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

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

  const showToast = (msg: string) => { toast(msg); };

  // Confirmation modal state & helper
  const [confirmState, setConfirmState] = useState<{ open: boolean; message: string; resolver?: (v:boolean)=>void }>({ open: false, message: '' });
  const requestConfirm = (message: string) => new Promise<boolean>((resolve) => {
    setConfirmState({ open: true, message, resolver: resolve });
  });

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

  const handleDeleteAlumno = async (id: number) => {
    const ok = await requestConfirm('¿Estás seguro que deseas eliminar este alumno? Esta acción no se puede deshacer.');
    if (!ok) return;
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

  const handleEditGasto = (id: number, updates: Partial<Gasto>) => {
    setGastos(gastos.map(g => g.id === id ? { ...g, ...updates } : g));
    showToast('✓ Gasto actualizado');
  };

  const handleDeleteGasto = async (id: number) => {
    const ok = await requestConfirm('¿Estás seguro que deseas eliminar este gasto? Esta acción no se puede deshacer.');
    if (!ok) return;
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

  const handleDeleteProfessor = async (id: number) => {
    const ok = await requestConfirm('¿Estás seguro que deseas eliminar este profesor? Esta acción no se puede deshacer.');
    if (!ok) return;
    setProfesores(profesores.filter(p => p.id !== id));
    showToast(`✓ Profesor eliminado`);
  };

  const handleAddInventoryItem = (item: Omit<InventarioItem, 'id'>) => {
    const id = Math.max(...inventario.map(i => i.id), 0) + 1;
    setInventario([...inventario, { ...item, id }]);
    showToast(`✓ Ítem agregado al inventario`);
  };

  const handleDeleteInventoryItem = async (id: number) => {
    const ok = await requestConfirm('¿Estás seguro que deseas eliminar este ítem de inventario? Esta acción no se puede deshacer.');
    if (!ok) return;
    setInventario(inventario.filter(i => i.id !== id));
    showToast(`✓ Ítem eliminado`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">

          {/* Marca */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/casa-musical-logo.png"
              alt="Casa Musical Academia"
              className="w-9 h-9 object-contain drop-shadow-sm"
            />
            <div className="hidden sm:block leading-tight">
              <h1
                className="text-sm font-semibold text-foreground"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Casa Musical
              </h1>
              <p className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground">
                Academia
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-0.5">
            {/* Toggle modo oscuro — estilo Copilot */}
            <button
              onClick={() => setDark(!dark)}
              title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/[0.07] transition-all"
            >
              {dark
                ? <Sun  className="w-[15px] h-[15px]" />
                : <Moon className="w-[15px] h-[15px]" />}
            </button>

            {/* Menú móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/[0.07] transition-all"
            >
              {mobileMenuOpen
                ? <X    className="w-[15px] h-[15px]" />
                : <Menu className="w-[15px] h-[15px]" />}
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {mobileMenuOpen && (
          <nav className="border-t border-border px-4 py-2 bg-card/70 overflow-x-auto">
            <div className="flex gap-1">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => { setTab(id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-full transition-all ${
                    tab === id
                      ? 'bg-accent text-accent-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* ── Navegación desktop — tabs tipo píldora ────────── */}
      <nav className="hidden sm:block border-b border-border bg-card/60 backdrop-blur-sm sticky top-[52px] z-30 overflow-x-auto">
        <div className="flex gap-0.5 px-4 py-2 max-w-7xl mx-auto">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-full transition-all ${
                tab === id
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Contenido principal ──────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 pb-16">
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
            requestConfirm={requestConfirm}
          />
        )}
        {tab === 'finanzas' && (
          <FinanceModule
            gastos={gastos}
            onAddGasto={handleAddGasto}
            onEditGasto={handleEditGasto}
            onDeleteGasto={handleDeleteGasto}
            requestConfirm={requestConfirm}
          />
        )}
        {tab === 'profesores' && (
          <TeacherModule
            professors={profesores}
            onAddProfessor={handleAddProfessor}
            onEditProfessor={handleEditProfessor}
            onDeleteProfessor={handleDeleteProfessor}
            requestConfirm={requestConfirm}
          />
        )}
        {tab === 'inventario' && (
          <InventoryModule
            items={inventario}
            onAddItem={handleAddInventoryItem}
            onEditItem={(id, updates) => {
              setInventario(inv => inv.map(i => i.id === id ? { ...i, ...updates } : i));
              showToast('✓ Ítem actualizado');
            }}
            onDeleteItem={handleDeleteInventoryItem}
            requestConfirm={requestConfirm}
          />
        )}
        {tab === 'crecimiento' && <GrowthModule />}
        {tab === 'documentos'  && <DocumentsModule />}
      </main>

      {/* ── Toaster Sonner ───────────────────────────────── */}
      <Toaster position="bottom-center" />

      {/* ── Modal de confirmación ────────────────────────── */}
      {confirmState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            className="bg-card border border-border rounded-xl p-5 w-full max-w-sm shadow-xl"
            style={{ boxShadow: '0 8px 32px rgba(28,16,8,0.18)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">⚠️</span>
              <p
                className="text-sm font-semibold text-foreground"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Confirmar acción
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              {confirmState.message}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { confirmState.resolver?.(false); setConfirmState({ open: false, message: '' }); }}
                className="px-4 py-2 text-sm rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => { confirmState.resolver?.(true); setConfirmState({ open: false, message: '' }); }}
                className="px-4 py-2 text-sm rounded-full bg-red-500/90 hover:bg-red-500 text-white transition-all shadow-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-center">
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
          Casa Musical Academia SPA
        </p>
        <p className="text-[9px] text-muted-foreground/60 mt-0.5">
          Espacio para crecer con la música 🎵
        </p>
      </footer>

    </div>
  );
}
