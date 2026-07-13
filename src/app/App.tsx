import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sun, Moon, Search, Download, Upload, Users, Wallet, BarChart3,
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
  GrupoFamiliar, SmartAlert, Documento, GrowthSnapshot
} from './utils/types';
import { getDashboardMetrics } from './utils/calculations';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { BUSINESS_CONFIG } from './config/business';

const TABS = [
  { id: 'dashboard', label: 'Inicio', Icon: BarChart3 },
  { id: 'alumnos', label: 'Alumnos', Icon: Users },
  { id: 'profesores', label: 'Profesores', Icon: BookOpen },
  { id: 'finanzas', label: 'Finanzas', Icon: Wallet },
  { id: 'inventario', label: 'Inventario', Icon: Package },
  { id: 'crecimiento', label: 'Progreso', Icon: Star },
  { id: 'documentos', label: 'Documentos', Icon: FileText },
] as const;

export default function App() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const [tab, setTab] = useState<typeof TABS[number]['id']>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [devMenuOpen, setDevMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const backupInputRef = useRef<HTMLInputElement | null>(null);

  const [alumnos, setAlumnos] = useState<Alumno[]>(() => load('cm_alumnos', []));
  const [profesores, setProfesores] = useState<Profesor[]>(() => load('cm_profesores', []));
  const [grupos, setGrupos] = useState<GrupoFamiliar[]>(() => load('cm_grupos', []));
  const [gastos, setGastos] = useState<Gasto[]>(() => load('cm_gastos', []));
  const [inventario, setInventario] = useState<InventarioItem[]>(() => load('cm_inventario', []));
  const [documentos, setDocumentos] = useState<Documento[]>(() => load('cm_documentos', []));

  // Recordatorio de respaldo: guarda timestamp del último respaldo
  const [lastBackupTs, setLastBackupTs] = useState<number>(() => load('cm_last_backup_ts', 0));
  const daysSinceBackup = lastBackupTs > 0
    ? Math.floor((Date.now() - lastBackupTs) / (1000 * 60 * 60 * 24))
    : null;
  const hasData = alumnos.length + gastos.length > 0;
  const showBackupReminder = hasData && (lastBackupTs === 0 || (daysSinceBackup !== null && daysSinceBackup >= 7));
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
  useEffect(() => { save('cm_documentos', documentos); }, [documentos]);

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

    if (metrics.flujoCaja < 0) {
      alerts.push({
        id: 'negative-cashflow',
        type: 'alert',
        title: 'Flujo de Caja Negativo',
        message: `Tus gastos superan ingresos por $${Math.abs(metrics.flujoCaja).toLocaleString('es-CL')}`,
        timestamp: Date.now(),
      });
    }

    if (profesores.length === 0) {
      alerts.push({
        id: 'no-professors',
        type: 'warning',
        title: 'Faltan Profesores',
        message: 'Aún no hay profesores registrados. Agrega al menos uno para asignar alumnos.',
        timestamp: Date.now(),
      });
    }

    const itemsEnMalEstado = inventario.filter(item => item.estado === 'malo').length;
    if (itemsEnMalEstado > 0) {
      alerts.push({
        id: 'inventory-maintenance',
        type: 'warning',
        title: 'Mantención de Inventario',
        message: `Hay ${itemsEnMalEstado} ítem(s) en mal estado que requieren revisión.`,
        timestamp: Date.now(),
      });
    }

    if (documentos.length === 0) {
      alerts.push({
        id: 'no-documents',
        type: 'info',
        title: 'Documentación Inicial',
        message: 'Te recomendamos cargar contratos o acuerdos para mantener respaldo administrativo.',
        timestamp: Date.now(),
      });
    }

    return alerts;
  }, [documentos, gastos, inventario, metrics, profesores.length]);

  const monthlyData = [
    { month: 'Ene', ingresos: 1200000, gastos: 800000 },
    { month: 'Feb', ingresos: 1350000, gastos: 820000 },
    { month: 'Mar', ingresos: 1500000, gastos: 900000 },
  ];

  const growthData = useMemo<GrowthSnapshot[]>(() => {
    const monthFormatter = new Intl.DateTimeFormat('es-CL', { month: 'short' });
    const now = new Date();
    const ingresosMensualesEstimados = alumnos.reduce((sum, a) => sum + (Number(a.aporte) || 0), 0);

    const monthKeys = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = monthFormatter.format(date).replace('.', '');
      const month = label.charAt(0).toUpperCase() + label.slice(1, 3);
      return { key, month };
    });

    const gastosPorMes = gastos.reduce<Record<string, number>>((acc, gasto) => {
      if (!gasto.fecha) return acc;
      const date = new Date(`${gasto.fecha}T00:00:00`);
      if (Number.isNaN(date.getTime())) return acc;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[key] = (acc[key] || 0) + (Number(gasto.monto) || 0);
      return acc;
    }, {});

    return monthKeys.map(({ key, month }) => ({
      month,
      alumnos: alumnos.length,
      ingresos: ingresosMensualesEstimados,
      gastos: gastosPorMes[key] || 0,
    }));
  }, [alumnos, gastos]);

  const agendaFinance = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const weeksInCalendar = Math.ceil((daysInMonth + firstWeekday) / 7);
    const extraWeeks = Math.max(0, weeksInCalendar - 4);

    const parseClassDate = (value: string) => {
      const direct = new Date(value);
      if (!Number.isNaN(direct.getTime())) return direct;
      const parts = value.split('-');
      if (parts.length === 3) {
        const parsed = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
      return null;
    };

    const rows = alumnos.map(alumno => {
      const aporte = Number(alumno.aporte) || 0;
      const valorClaseBase = aporte / BUSINESS_CONFIG.monthlyBaseClasses;
      const clasesMesActual = (alumno.clases || []).filter(clase => {
        if (!clase?.fecha) return false;
        const classDate = parseClassDate(clase.fecha);
        return !!classDate && classDate.getFullYear() === year && classDate.getMonth() === month;
      }).length;
      const clasesExtraPotenciales = Math.max(0, extraWeeks);
      const costoPotencialExtra = Math.round(valorClaseBase * clasesExtraPotenciales);

      return {
        id: alumno.id,
        nombre: alumno.nombre,
        aporte,
        valorClaseBase: Math.round(valorClaseBase),
        clasesMesActual,
        clasesBase: BUSINESS_CONFIG.monthlyBaseClasses,
        clasesExtraPotenciales,
        costoPotencialExtra,
      };
    });

    return {
      monthLabel: new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(now),
      weeksInCalendar,
      extraWeeks,
      totalExtraPotential: rows.reduce((sum, row) => sum + row.costoPotencialExtra, 0),
      coveredStudents: rows.filter(row => row.clasesMesActual >= 4).length,
      rows: rows.sort((a, b) => b.costoPotencialExtra - a.costoPotencialExtra),
    };
  }, [alumnos]);

  const quickSearchResults = useMemo<Array<{ tab: typeof TABS[number]['id']; label: string; count: number }>>(() => {
    const query = quickSearch.trim().toLowerCase();
    if (!query) return [];

    const includes = (value: string | number | undefined | null) =>
      String(value || '').toLowerCase().includes(query);

    const results: Array<{ tab: typeof TABS[number]['id']; label: string; count: number }> = [];
    const addResult = (tabId: typeof TABS[number]['id'], label: string, count: number) => {
      if (count > 0) results.push({ tab: tabId, label, count });
    };

    addResult('alumnos', 'Alumnos', alumnos.filter(a =>
      includes(a.nombre) || includes(a.apoderado) || includes(a.instrumento) || includes(a.profesor)
    ).length);

    addResult('profesores', 'Profesores', profesores.filter(p =>
      includes(p.nombre) || includes(p.especialidad)
    ).length);

    addResult('finanzas', 'Finanzas', gastos.filter(g =>
      includes(g.concepto) || includes(g.categoria) || includes(g.fecha)
    ).length);

    addResult('inventario', 'Inventario', inventario.filter(i =>
      includes(i.nombre) || includes(i.categoria) || includes(i.ubicacion)
    ).length);

    addResult('documentos', 'Documentos', documentos.filter(d =>
      includes(d.nombre) || includes(d.descripcion) || includes(d.tipo)
    ).length);

    const tabByName = TABS.find(t => t.label.toLowerCase().includes(query));
    if (tabByName && !results.some(r => r.tab === tabByName.id)) {
      results.push({ tab: tabByName.id, label: tabByName.label, count: 1 });
    }

    return results.sort((a, b) => b.count - a.count).slice(0, 5);
  }, [alumnos, documentos, gastos, inventario, profesores, quickSearch]);
  const activeTabMeta = TABS.find(t => t.id === tab) ?? TABS[0];

  const handleAddAlumno = (newAlumno: Omit<Alumno, 'id' | 'clases'>) => {
    const id = Math.max(...alumnos.map(a => a.id), 0) + 1;
    setAlumnos([...alumnos, { ...newAlumno, id, clases: [], pagado: newAlumno.pagado ?? false }]);
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

  const handleAddDocument = (doc: Omit<Documento, 'id'>) => {
    const id = Math.max(...documentos.map(d => d.id), 0) + 1;
    setDocumentos(prev => [...prev, { ...doc, id }]);
    showToast('✓ Documento agregado');
  };

  const handleDeleteDocument = async (id: number) => {
    const ok = await requestConfirm('¿Eliminar este documento? Esta acción no se puede deshacer.');
    if (!ok) return;
    setDocumentos(prev => prev.filter(d => d.id !== id));
    showToast('✓ Documento eliminado');
  };

  const handleExportBackup = () => {
    const totalRegistros = alumnos.length + profesores.length + gastos.length + inventario.length + documentos.length;
    const payload = {
      version: 1,
      generatedAt: new Date().toISOString(),
      alumnos,
      profesores,
      grupos,
      gastos,
      inventario,
      documentos,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
    link.href = url;
    link.download = `casa-musical-respaldo-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    save('cm_last_backup_ts', Date.now());
    setLastBackupTs(Date.now());
    showToast(`✓ Respaldo descargado (${totalRegistros} registros)`);
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      alert('El archivo no es un respaldo válido (JSON incorrecto).');
      event.target.value = '';
      return;
    }

    if (!parsed || typeof parsed !== 'object') {
      alert('Formato de respaldo inválido.');
      event.target.value = '';
      return;
    }

    const data = parsed as Record<string, unknown>;
    const alumnosData = Array.isArray(data.alumnos) ? (data.alumnos as Alumno[]) : null;
    const profesoresData = Array.isArray(data.profesores) ? (data.profesores as Profesor[]) : null;
    const gruposData = Array.isArray(data.grupos) ? (data.grupos as GrupoFamiliar[]) : null;
    const gastosData = Array.isArray(data.gastos) ? (data.gastos as Gasto[]) : null;
    const inventarioData = Array.isArray(data.inventario) ? (data.inventario as InventarioItem[]) : null;
    const documentosData = Array.isArray(data.documentos) ? (data.documentos as Documento[]) : null;

    if (!alumnosData || !profesoresData || !gruposData || !gastosData || !inventarioData || !documentosData) {
      alert('El respaldo no tiene la estructura esperada.');
      event.target.value = '';
      return;
    }

    const ok = await requestConfirm('Esto reemplazará todos los datos actuales por los del respaldo. ¿Deseas continuar?');
    if (!ok) {
      event.target.value = '';
      return;
    }

    setAlumnos(alumnosData);
    setProfesores(profesoresData);
    setGrupos(gruposData);
    setGastos(gastosData);
    setInventario(inventarioData);
    setDocumentos(documentosData);
    const totalRestaurado =
      alumnosData.length +
      profesoresData.length +
      gastosData.length +
      inventarioData.length +
      documentosData.length;
    showToast(`✓ Respaldo restaurado (${totalRestaurado} registros)`);
    event.target.value = '';
  };

  const handleGenerateSimulatedData = async (months: 6 | 12 | 24 | 36) => {
    const periodLabel = months === 6 ? '6 meses' : `${months / 12} año(s)`;
    const ok = await requestConfirm(`Se crearán datos simulados de ${periodLabel} y se reemplazarán los actuales. ¿Continuar?`);
    if (!ok) return;

    const backupPayload = {
      alumnos,
      profesores,
      grupos,
      gastos,
      inventario,
      documentos,
    };
    save('cm_simulation_backup', backupPayload);

    const today = new Date();
    const teachers: Profesor[] = [
      { id: 1, nombre: 'Camila Rojas', especialidad: 'Piano', valorHora: 18000 },
      { id: 2, nombre: 'Diego Soto', especialidad: 'Flauta', valorHora: 17000 },
      { id: 3, nombre: 'Valentina Núñez', especialidad: 'Ukelele', valorHora: 18500 },
      { id: 4, nombre: 'Matías Pérez', especialidad: 'Iniciación temprana', valorHora: 17500 },
    ];
    const instruments = ['Iniciación temprana', 'Piano', 'Flauta', 'Ukelele'];
    const studentNames = [
      'Sofía', 'Martín', 'Javiera', 'Benjamín', 'Isidora', 'Tomás', 'Antonia', 'Vicente',
      'Florencia', 'Agustín', 'Emilia', 'Mateo', 'Trinidad', 'Lucas', 'Josefa', 'Maximiliano',
      'Amanda', 'Ignacio', 'Catalina', 'Joaquín', 'Renata', 'Cristóbal', 'Dominga', 'Sebastián',
    ];

    const studentCount = Math.min(36, 12 + Math.round(months / 2));
    const students: Alumno[] = Array.from({ length: studentCount }, (_, index) => {
      const id = index + 1;
      const aporte = 42000 + (index % 6) * 5000;
      const clases: Alumno['clases'] = [];

      for (let monthOffset = months - 1; monthOffset >= 0; monthOffset--) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
        const monthlyClasses = BUSINESS_CONFIG.monthlyBaseClasses + ((monthOffset + index) % 4 === 0 ? 1 : 0);
        for (let classIdx = 0; classIdx < monthlyClasses; classIdx++) {
          const day = Math.min(28, 3 + classIdx * 7 + (index % 3));
          const classDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
          clases.push({
            fecha: classDate.toISOString().slice(0, 10),
            contenido: ['Técnica', 'Repertorio', 'Lectura musical', 'Ensamble'][classIdx % 4],
          });
        }
      }

      return {
        id,
        nombre: `${studentNames[index % studentNames.length]} ${String.fromCharCode(65 + (index % 26))}.`,
        apoderado: `Apoderado ${id}`,
        instrumento: instruments[index % instruments.length],
        profesor: teachers[index % teachers.length].nombre,
        aporte,
        modalidad: index % 2 === 0 ? 'Presencial' : 'Online',
        grupoFamiliar: index % 5 === 0,
        clases,
        pagado: index % 4 !== 0,
      };
    });

    const familyGroups: GrupoFamiliar[] = [];
    for (let i = 0; i < students.length; i += 2) {
      if (!students[i + 1]) break;
      familyGroups.push({
        id: familyGroups.length + 1,
        nombre: `Familia ${familyGroups.length + 1}`,
        miembros: [students[i].id, students[i + 1].id],
        descuento: 10,
      });
    }

    const expenseCategories = ['Arriendo', 'Servicios', 'Marketing', 'Mantención'];
    const expenses: Gasto[] = [];
    for (let monthOffset = months - 1; monthOffset >= 0; monthOffset--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
      for (let c = 0; c < expenseCategories.length; c++) {
        const amountBase = [280000, 120000, 65000, 45000][c];
        const variability = ((monthOffset + c) % 5) * 9000;
        const day = 5 + c * 6;
        const expenseDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        expenses.push({
          id: expenses.length + 1,
          concepto: `${expenseCategories[c]} ${monthDate.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })}`,
          categoria: expenseCategories[c],
          monto: amountBase + variability,
          fecha: expenseDate.toISOString().slice(0, 10),
          automatico: c < 2,
        });
      }
    }

    const inventory: InventarioItem[] = [
      { id: 1, nombre: 'Piano digital Yamaha', categoria: 'Instrumento', cantidad: 2, estado: 'bueno', ubicacion: 'Sala 1' },
      { id: 2, nombre: 'Flautas dulces', categoria: 'Instrumento', cantidad: 8, estado: 'bueno', ubicacion: 'Bodega' },
      { id: 3, nombre: 'Atriles', categoria: 'Accesorio', cantidad: 12, estado: 'regular', ubicacion: 'Sala 2' },
      { id: 4, nombre: 'Micrófonos', categoria: 'Audio', cantidad: 4, estado: 'bueno', ubicacion: 'Sala 3' },
      { id: 5, nombre: 'Ukeleles', categoria: 'Instrumento', cantidad: 6, estado: 'regular', ubicacion: 'Sala 4' },
    ];

    const docs: Documento[] = Array.from({ length: Math.max(3, Math.round(months / 2)) }, (_, i) => {
      const date = new Date(today.getFullYear(), today.getMonth() - i * 2, 12);
      return {
        id: i + 1,
        nombre: `Informe académico ${date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`,
        tipo: i % 2 === 0 ? 'reporte' : 'recibo',
        fecha: date.toISOString().slice(0, 10),
        descripcion: 'Documento generado para pruebas visuales y de flujo.',
      };
    });

    setAlumnos(students);
    setProfesores(teachers);
    setGrupos(familyGroups);
    setGastos(expenses);
    setInventario(inventory);
    setDocumentos(docs);
    save('cm_simulation_active', true);
    showToast(`✓ Datos simulados cargados (${periodLabel})`);
  };

  const handleClearSimulatedData = async () => {
    const ok = await requestConfirm('Se eliminarán los datos simulados. ¿Deseas restaurar el estado anterior?');
    if (!ok) return;

    const backup = load<{
      alumnos: Alumno[];
      profesores: Profesor[];
      grupos: GrupoFamiliar[];
      gastos: Gasto[];
      inventario: InventarioItem[];
      documentos: Documento[];
    } | null>('cm_simulation_backup', null);

    if (backup) {
      setAlumnos(backup.alumnos || []);
      setProfesores(backup.profesores || []);
      setGrupos(backup.grupos || []);
      setGastos(backup.gastos || []);
      setInventario(backup.inventario || []);
      setDocumentos(backup.documentos || []);
    } else {
      setAlumnos([]);
      setProfesores([]);
      setGrupos([]);
      setGastos([]);
      setInventario([]);
      setDocumentos([]);
    }

    save('cm_simulation_backup', null);
    save('cm_simulation_active', false);
    showToast('✓ Datos simulados eliminados');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">

          {/* Marca */}
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}assets/casa-musical-logo.png`}
              alt="Casa Musical Academia"
              className="w-12 h-12 object-contain drop-shadow-sm"
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
            <div className="hidden md:block relative mr-1">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Buscar rápido..."
                className="h-8 w-44 lg:w-56 rounded-full border border-border bg-background/80 pl-7 pr-3 text-xs text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {quickSearch.trim() && quickSearchResults.length > 0 && (
                <div className="absolute right-0 mt-1 w-64 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-50">
                  {quickSearchResults.map(result => (
                    <button
                      key={result.tab}
                      onClick={() => { setTab(result.tab); setQuickSearch(''); }}
                      className="w-full px-3 py-2 text-left hover:bg-muted/60 transition-colors"
                    >
                      <p className="text-xs font-medium text-foreground">{result.label}</p>
                      <p className="text-[11px] text-muted-foreground">{result.count} coincidencia(s)</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleExportBackup}
              title="Guardar copia (.json)"
              className="h-8 px-2.5 flex items-center justify-center gap-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/[0.07] transition-all"
            >
              <Download className="w-[15px] h-[15px]" />
              <span className="text-[11px]">Guardar</span>
            </button>

            <button
              onClick={() => backupInputRef.current?.click()}
              title="Cargar copia (.json)"
              className="h-8 px-2.5 flex items-center justify-center gap-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/[0.07] transition-all"
            >
              <Upload className="w-[15px] h-[15px]" />
              <span className="text-[11px]">Cargar</span>
            </button>

            <button
              onClick={() => setDevMenuOpen(!devMenuOpen)}
              title="Opciones de desarrollador"
              className={`h-8 px-2 md:px-2.5 flex items-center justify-center gap-1 rounded-full transition-all ${
                devMenuOpen
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.07]'
              }`}
            >
              <span className="text-[11px] font-semibold">Dev</span>
            </button>

            {/* Toggle modo oscuro — estilo Copilot */}
            <button
              onClick={() => setDark(!dark)}
              title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="h-8 px-2.5 flex items-center justify-center gap-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/[0.07] transition-all"
            >
              {dark
                ? <Sun  className="w-[15px] h-[15px]" />
                : <Moon className="w-[15px] h-[15px]" />}
              <span className="hidden sm:inline text-[11px]">Tema</span>
            </button>

            {/* Menú principal tipo hamburguesa */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className={`h-8 px-2.5 flex items-center justify-center gap-1 rounded-full transition-all ${
                mobileMenuOpen
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.07]'
              }`}
            >
              {mobileMenuOpen
                ? <X    className="w-[15px] h-[15px]" />
                : <Menu className="w-[15px] h-[15px]" />}
              <span className="text-[11px]">Menú</span>
            </button>
            <input
              ref={backupInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportBackup}
            />
          </div>
        </div>

        {/* Menú principal desplegable */}
        {mobileMenuOpen && (
          <nav className="border-t border-border px-4 py-2 bg-card/70">
            <div className="max-w-7xl mx-auto flex flex-wrap gap-1.5">
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

        {devMenuOpen && (
          <nav className="border-t border-border px-4 py-2 bg-card/60">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
              <button
                onClick={() => { void handleGenerateSimulatedData(6); setDevMenuOpen(false); }}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-background/70 hover:bg-muted/70 transition-colors"
              >
                Simular 6 meses
              </button>
              <button
                onClick={() => { void handleGenerateSimulatedData(12); setDevMenuOpen(false); }}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-background/70 hover:bg-muted/70 transition-colors"
              >
                Simular 1 año
              </button>
              <button
                onClick={() => { void handleGenerateSimulatedData(24); setDevMenuOpen(false); }}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-background/70 hover:bg-muted/70 transition-colors"
              >
                Simular 2 años
              </button>
              <button
                onClick={() => { void handleGenerateSimulatedData(36); setDevMenuOpen(false); }}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-background/70 hover:bg-muted/70 transition-colors"
              >
                Simular 3 años
              </button>
              <button
                onClick={() => { void handleClearSimulatedData(); setDevMenuOpen(false); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-full border border-red-400/60 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Borrar simulación
              </button>
            </div>
          </nav>
        )}
      </header>

      <div className="border-b border-border bg-card/40 backdrop-blur-sm px-4 py-1.5">
        <div className="max-w-7xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/70 text-foreground">
            <activeTabMeta.Icon className="w-3 h-3" />
            {activeTabMeta.label}
          </span>
        </div>
      </div>

      {/* ── Contenido principal ──────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 pb-16 fade-in-up-soft">

        {/* Banner recordatorio de respaldo */}
        {showBackupReminder && (
          <div className="mb-4 flex items-center justify-between gap-3 bg-yellow-500/10 border border-yellow-500/40 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base flex-shrink-0">💾</span>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                {lastBackupTs === 0
                  ? 'Aún no tienes un respaldo guardado. Descárgalo para no perder tus datos.'
                  : `Han pasado ${daysSinceBackup} días desde tu último respaldo. Te recomendamos descargar uno nuevo.`}
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/30 transition-colors"
            >
              Descargar ahora
            </button>
          </div>
        )}

        {tab === 'dashboard' && (
          <Dashboard
            metrics={metrics}
            alerts={smartAlerts}
            monthlyData={monthlyData}
            agendaFinance={agendaFinance}
          />
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
        {tab === 'crecimiento' && <GrowthModule data={growthData} capacidadMaxima={50} />}
        {tab === 'documentos'  && (
          <DocumentsModule
            documents={documentos}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}
      </main>

      {/* ── Toaster Sonner ───────────────────────────────── */}
      <Toaster position="bottom-center" />

      {/* ── Modal de confirmación ────────────────────────── */}
      {confirmState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            className="bg-card border border-border rounded-xl p-5 w-full max-w-sm shadow-xl soft-pop"
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
