import React from 'react';
import { Users, Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { Alumno } from '../../../utils/types';
import { FormInput } from '../../ui/inputs/FormInput';
import { FormSelect } from '../../ui/inputs/FormSelect';
import { SearchBar } from '../../ui/common/SearchBar';
import { BUSINESS_CONFIG } from '../../../config/business';

interface StudentListProps {
  students: Alumno[];
  professors: string[];
  onAdd: (student: Omit<Alumno, 'id' | 'clases'>) => void;
  onEdit: (id: number, updates: Partial<Alumno>) => void;
  onDelete: (id: number) => void;
  requestConfirm?: (message: string) => Promise<boolean>;
}

interface NewStudentForm {
  nombre: string;
  apoderado: string;
  instrumento: string;
  profesor: string;
  aporte: number;
  aporteCustom: number;
}

const INITIAL_STUDENT: NewStudentForm = {
  nombre: '',
  apoderado: '',
  instrumento: '',
  profesor: '',
  aporte: 100000,
  aporteCustom: 0,
};

const APORTE_OPTIONS = [
  { value: 100000, label: '$100.000' },
  { value: 140000, label: '$140.000' },
  { value: 180000, label: '$180.000' },
  { value: 270000, label: '$270.000' },
  { value: 0, label: 'Otro monto' },
];

const COMMON_INSTRUMENTS = ['Piano', 'Guitarra', 'Canto', 'Violín', 'Batería', 'Ukelele'];
const CLASS_NOTE_SUGGESTIONS = [
  'Técnica de respiración y apoyo',
  'Escalas y coordinación rítmica',
  'Lectura musical y metrónomo',
  'Repertorio y expresión musical',
];

export function StudentModule({ students, professors, onAdd, onEdit, onDelete, requestConfirm }: StudentListProps) {
  const [newStudent, setNewStudent] = React.useState<NewStudentForm>(INITIAL_STUDENT);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterInstrument, setFilterInstrument] = React.useState<string>('');
  const [filterProfessor, setFilterProfessor] = React.useState<string>('');
  const [classNotes, setClassNotes] = React.useState<Record<number, string>>({});
  const [classDates, setClassDates] = React.useState<Record<number, string>>({});

  const getTodayDateString = React.useCallback(() => {
    const today = new Date();
    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
  }, []);

  const instrumentos = Array.from(new Set(students.map(s => s.instrumento))).filter(Boolean);

  // Filtered students
  const filteredStudents = React.useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.apoderado.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesInstrument = !filterInstrument || student.instrumento === filterInstrument;
      const matchesProfessor = !filterProfessor || student.profesor === filterProfessor;
      
      return matchesSearch && matchesInstrument && matchesProfessor;
    });
  }, [students, searchQuery, filterInstrument, filterProfessor]);

  const handleAddStudent = React.useCallback(async () => {
    const nombre = newStudent.nombre.trim();
    const apoderado = newStudent.apoderado.trim();
    if (!nombre || !apoderado) {
      alert('Por favor completa nombre y apoderado');
      return;
    }

    const instrumento = (newStudent.instrumento || '').trim();
    if (!instrumento) {
      const ok = requestConfirm ? await requestConfirm('No se indicó instrumento. ¿Deseas continuar sin instrumento?') : confirm('No se indicó instrumento. ¿Deseas continuar sin instrumento?');
      if (!ok) return;
    }

    const aporte = newStudent.aporte === 0 ? Number(newStudent.aporteCustom) : Number(newStudent.aporte);
    if (!aporte || aporte <= 0) {
      alert('El aporte debe ser mayor que 0');
      return;
    }

    const isDuplicate = students.some(s => s.nombre.toLowerCase() === nombre.toLowerCase() && s.apoderado.toLowerCase() === apoderado.toLowerCase());
    if (isDuplicate) {
      const ok = requestConfirm ? await requestConfirm('Ya existe un alumno con ese nombre y apoderado. ¿Deseas agregar igualmente?') : confirm('Ya existe un alumno con ese nombre y apoderado. ¿Deseas agregar igualmente?');
      if (!ok) return;
    }

    onAdd({
      nombre,
      apoderado,
      instrumento,
      profesor: newStudent.profesor,
      aporte,
      modalidad: 'individual',
      grupoFamiliar: false,
    });

    setNewStudent(INITIAL_STUDENT);
  }, [newStudent, onAdd, students, requestConfirm]);

  const updateField = React.useCallback(<K extends keyof NewStudentForm>(
    field: K,
    value: NewStudentForm[K]
  ) => {
    setNewStudent(prev => ({ ...prev, [field]: value }));
  }, []);

  const registerClass = React.useCallback((student: Alumno) => {
    const dateString = classDates[student.id] || getTodayDateString();
    const clases = Array.isArray(student.clases) ? [...student.clases] : [];
    const alreadyRegisteredDate = clases.some(c => c.fecha === dateString);
    const customNote = (classNotes[student.id] || '').trim();
    const nextClass = {
      fecha: dateString,
      contenido: customNote || (alreadyRegisteredDate ? 'Clase adicional registrada' : 'Clase realizada'),
    };
    onEdit(student.id, { clases: [...clases, nextClass] });
    setClassNotes(prev => ({ ...prev, [student.id]: '' }));
    setClassDates(prev => ({ ...prev, [student.id]: dateString }));
  }, [classDates, classNotes, getTodayDateString, onEdit]);

  const removeLastClass = React.useCallback((student: Alumno) => {
    const clases = Array.isArray(student.clases) ? [...student.clases] : [];
    if (clases.length === 0) return;
    clases.pop();
    onEdit(student.id, { clases });
  }, [onEdit]);

  const togglePaymentState = React.useCallback((student: Alumno) => {
    onEdit(student.id, { pagado: !student.pagado });
  }, [onEdit]);

  const getCurrentMonthClasses = React.useCallback((student: Alumno) => {
    const now = new Date();
    return (student.clases || []).filter(clase => {
      const d = new Date(`${clase.fecha}T00:00:00`);
      return !Number.isNaN(d.getTime()) && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
  }, []);

  const getMonthlyClassFinanceSummary = React.useCallback((student: Alumno) => {
    const monthClasses = getCurrentMonthClasses(student);
    const aporteMensual = Number(student.aporte) || 0;
    const valorClase = aporteMensual / BUSINESS_CONFIG.monthlyBaseClasses;
    const clasesIncluidas = Math.min(BUSINESS_CONFIG.monthlyBaseClasses, monthClasses.length);
    const clasesExtra = Math.max(0, monthClasses.length - BUSINESS_CONFIG.monthlyBaseClasses);
    const totalExtra = Math.round(valorClase * clasesExtra);
    return {
      monthClasses,
      aporteMensual,
      valorClase,
      clasesIncluidas,
      clasesExtra,
      totalExtra,
      totalPeriodo: aporteMensual + totalExtra,
    };
  }, [getCurrentMonthClasses]);

  const escapeHtml = React.useCallback((value: string) => (
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  ), []);

  const exportParentVoucher = React.useCallback((student: Alumno) => {
    const {
      monthClasses,
      aporteMensual,
      valorClase,
      clasesIncluidas,
      clasesExtra,
      totalExtra,
      totalPeriodo,
    } = getMonthlyClassFinanceSummary(student);
    const totalBase = aporteMensual;
    const estadoPago = student.pagado ? BUSINESS_CONFIG.paymentLabelPaid : BUSINESS_CONFIG.paymentLabelPending;
    const periodo = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(new Date());

    const rows = monthClasses.length > 0
      ? monthClasses.map((clase, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(clase.fecha)}</td>
          <td>${escapeHtml(clase.contenido || 'Clase realizada')}</td>
        </tr>
      `).join('')
      : `<tr><td colspan="3" style="text-align:center;color:#8B7355;">Aún no hay clases registradas este mes.</td></tr>`;

    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Voucher ${escapeHtml(student.nombre)} | ${BUSINESS_CONFIG.brandName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; background: #FAF6EE; color: #1C1008; padding: 34px 38px; max-width: 860px; margin: 0 auto; position: relative; overflow: hidden; }
    .watermark {
      position: fixed;
      inset: 0;
      background: url('/assets/casa-musical-logo.png') no-repeat center 56%;
      background-size: 340px;
      opacity: 0.04;
      pointer-events: none;
      z-index: 0;
    }
    .sheet { position: relative; z-index: 1; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #C9A227; padding-bottom: 12px; margin-bottom: 18px; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand img { width: 42px; height: 42px; object-fit: contain; }
    .brand-title { font-family: 'Playfair Display', Georgia, serif; font-size: 23px; line-height: 1.05; }
    .brand-sub { font-size: 9px; letter-spacing: .22em; text-transform: uppercase; color: #8B7355; margin-top: 2px; }
    .meta { text-align: right; font-size: 11px; color: #8B7355; }
    .card { background: #FFFCF5; border: 1px solid rgba(201,162,39,.3); border-radius: 12px; padding: 14px; margin-bottom: 14px; }
    .title { font-size: 15px; font-weight: 600; margin-bottom: 10px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .item-label { font-size: 11px; color: #8B7355; text-transform: uppercase; letter-spacing: .06em; }
    .item-value { font-size: 13px; color: #1C1008; font-weight: 500; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { text-align: left; padding: 8px 10px; background: #EDE4CF; font-size: 11px; color: #8B7355; border-bottom: 1px solid rgba(201,162,39,.35); }
    td { padding: 8px 10px; border-bottom: 1px solid rgba(139,100,40,.12); font-size: 12px; }
    .totals { margin-top: 12px; border-top: 1px solid rgba(139,100,40,.2); padding-top: 10px; display: grid; gap: 6px; }
    .totals-row { display: flex; justify-content: space-between; font-size: 12px; }
    .totals-row strong { font-size: 13px; color: #1C1008; }
    .footer { margin-top: 16px; font-size: 10px; color: #8B7355; display: flex; justify-content: space-between; }
    @media print { body { padding: 20px 24px; } @page { margin: 0.8cm 1cm; } }
  </style>
</head>
<body>
  <div class="watermark"></div>
  <main class="sheet">
  <header class="header">
    <div class="brand">
      <img src="/assets/casa-musical-logo.png" alt="Casa Musical" />
      <div>
        <p class="brand-title">${BUSINESS_CONFIG.brandName}</p>
        <p class="brand-sub">Academia SPA</p>
      </div>
    </div>
    <div class="meta">
      <p>${BUSINESS_CONFIG.voucherTitle}</p>
      <p>Periodo: ${escapeHtml(periodo)}</p>
    </div>
  </header>

  <section class="card">
    <p class="title">Detalle del alumno</p>
    <div class="grid">
      <div><p class="item-label">Alumno</p><p class="item-value">${escapeHtml(student.nombre)}</p></div>
      <div><p class="item-label">Apoderado</p><p class="item-value">${escapeHtml(student.apoderado)}</p></div>
      <div><p class="item-label">Instrumento</p><p class="item-value">${escapeHtml(student.instrumento || '-')}</p></div>
      <div><p class="item-label">Profesor</p><p class="item-value">${escapeHtml(student.profesor || '-')}</p></div>
      <div><p class="item-label">Estado de pago mensual</p><p class="item-value">${escapeHtml(estadoPago)}</p></div>
    </div>
  </section>

  <section class="card">
    <p class="title">Clases registradas en el periodo</p>
    <table>
      <thead>
        <tr><th>#</th><th>Fecha</th><th>Descripción breve</th></tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row"><span>Aporte mensual (incluye ${BUSINESS_CONFIG.monthlyBaseClasses} clases)</span><span>$${totalBase.toLocaleString('es-CL')}</span></div>
      <div class="totals-row"><span>Valor referencial por clase</span><span>$${Math.round(valorClase).toLocaleString('es-CL')}</span></div>
      <div class="totals-row"><span>Clases incluidas usadas</span><span>${clasesIncluidas} / ${BUSINESS_CONFIG.monthlyBaseClasses}</span></div>
      <div class="totals-row"><span>Clases extra del periodo</span><span>${clasesExtra}</span></div>
      <div class="totals-row"><span>Total extra referencial</span><span>$${totalExtra.toLocaleString('es-CL')}</span></div>
      <div class="totals-row"><strong>Total referencial periodo</strong><strong>$${totalPeriodo.toLocaleString('es-CL')}</strong></div>
    </div>
    <p style="margin-top:10px;font-size:10px;color:#8B7355;">${BUSINESS_CONFIG.policyNote}</p>
  </section>

  <footer class="footer">
    <span>${BUSINESS_CONFIG.legalName}</span>
    <span>${BUSINESS_CONFIG.voucherAudienceLabel}</span>
  </footer>
  </main>

  <script>window.onload=()=>setTimeout(()=>window.print(),350)<\/script>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) {
      alert('Activa las ventanas emergentes para generar el voucher.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  }, [escapeHtml, getMonthlyClassFinanceSummary]);

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Total Alumnos</p>
          <p className="text-2xl font-bold text-foreground">{students.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Ingresos</p>
          <p className="text-2xl font-bold text-green-500">
            ${(students.reduce((s, a) => s + a.aporte, 0) / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Profesores</p>
          <p className="text-2xl font-bold text-accent">{professors.length}</p>
        </div>
      </div>

      {/* Add Student Form */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Registrar Nuevo Alumno</h3>
        </div>
        <div className="space-y-2">
          <FormInput
            placeholder="Nombre del alumno"
            value={newStudent.nombre}
            onChange={(e) => updateField('nombre', e.target.value)}
            label="Nombre"
          />
          <FormInput
            placeholder="Nombre del apoderado"
            value={newStudent.apoderado}
            onChange={(e) => updateField('apoderado', e.target.value)}
            label="Apoderado"
          />
          <FormInput
            placeholder="Ej: Guitarra, Piano, etc"
            value={newStudent.instrumento}
            onChange={(e) => updateField('instrumento', e.target.value)}
            label="Instrumento"
          />
          <div className="flex flex-wrap gap-1">
            {COMMON_INSTRUMENTS.map(inst => (
              <button
                key={inst}
                type="button"
                onClick={() => updateField('instrumento', inst)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  newStudent.instrumento === inst
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {inst}
              </button>
            ))}
          </div>
          <FormSelect
            label="Profesor"
            value={newStudent.profesor}
            onChange={(e) => updateField('profesor', e.target.value)}
            options={professors.map(p => ({ value: p, label: p }))}
            placeholder="Selecciona un profesor"
          />
          {professors.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {professors.slice(0, 6).map(prof => (
                <button
                  key={prof}
                  type="button"
                  onClick={() => updateField('profesor', prof)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    newStudent.profesor === prof
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {prof}
                </button>
              ))}
            </div>
          )}
          <FormSelect
            label="Aporte Mensual"
            value={newStudent.aporte}
            onChange={(e) => updateField('aporte', Number(e.target.value))}
            options={APORTE_OPTIONS}
          />
          {newStudent.aporte === 0 && (
            <FormInput
              type="number"
              placeholder="Ingresa el monto personalizado"
              value={newStudent.aporteCustom || ''}
              onChange={(e) => updateField('aporteCustom', Number(e.target.value))}
              label="Monto Personalizado"
            />
          )}
        </div>
        <button
          onClick={handleAddStudent}
          className="w-full mt-3 bg-accent hover:bg-accent/80 text-accent-foreground font-semibold py-2 rounded-lg transition-colors"
        >
          Agregar Alumno
        </button>
      </div>

      {/* Students List */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold">Alumnos Registrados</h3>
            <span className="text-xs text-muted-foreground ml-2">({filteredStudents.length})</span>
          </div>

          <div className="flex gap-2 items-center w-1/2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar por alumno o apoderado" />
            <div className="flex gap-2 ml-2">
              <FormSelect
                label="Instrumento"
                value={filterInstrument}
                onChange={(e) => setFilterInstrument(e.target.value)}
                options={[{ value: '', label: 'Todos' }, ...instrumentos.map(i => ({ value: i, label: i }))]}
              />
              <FormSelect
                label="Profesor"
                value={filterProfessor}
                onChange={(e) => setFilterProfessor(e.target.value)}
                options={[{ value: '', label: 'Todos' }, ...professors.map(p => ({ value: p, label: p }))]}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No hay alumnos que coincidan</p>
          ) : (
            filteredStudents.map(student => {
              const monthlySummary = getMonthlyClassFinanceSummary(student);
              return (
              <div key={student.id} className="bg-muted/40 p-3 rounded-lg hover:bg-muted/60 transition-colors">
                {editingId === student.id ? (
                  <div className="space-y-2">
                    <FormInput value={student.nombre} onChange={(e) => setNewStudent(prev => ({...prev, nombre: e.target.value}))} label="Nombre" />
                    <FormInput value={student.apoderado} onChange={(e) => setNewStudent(prev => ({...prev, apoderado: e.target.value}))} label="Apoderado" />
                    <FormInput value={student.instrumento} onChange={(e) => setNewStudent(prev => ({...prev, instrumento: e.target.value}))} label="Instrumento" />
                    <FormSelect label="Profesor" value={student.profesor} onChange={(e)=> setNewStudent(prev => ({...prev, profesor: e.target.value}))} options={professors.map(p => ({value: p, label: p}))} />
                    <FormInput type="number" value={student.aporte} onChange={(e) => setNewStudent(prev => ({...prev, aporte: Number(e.target.value)}))} label="Aporte" />
                    <div className="flex gap-2">
                      <button onClick={() => {
                        const updates = {
                          nombre: (newStudent.nombre || student.nombre),
                          apoderado: (newStudent.apoderado || student.apoderado),
                          instrumento: (newStudent.instrumento || student.instrumento),
                          profesor: (newStudent.profesor || student.profesor),
                          aporte: newStudent.aporte === 0 ? (newStudent.aporteCustom || student.aporte) : newStudent.aporte || student.aporte,
                        };
                        onEdit(student.id, updates);
                        setEditingId(null);
                        setNewStudent(INITIAL_STUDENT);
                      }} className="px-3 py-2 bg-accent text-accent-foreground rounded-md">Guardar</button>
                      <button onClick={() => { setEditingId(null); setNewStudent(INITIAL_STUDENT); }} className="px-3 py-2 bg-muted text-foreground rounded-md">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{student.nombre}</p>
                      <p className="text-xs text-muted-foreground">{student.instrumento} • {student.profesor}</p>
                      <p className="text-xs text-green-500 font-medium mt-1">${student.aporte.toLocaleString('es-CL')}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Clases registradas: {student.clases?.length || 0}
                      </p>
                      <p className={`text-[11px] mt-1 font-medium ${student.pagado ? 'text-green-600' : 'text-yellow-600'}`}>
                        Estado pago mensual: {student.pagado ? BUSINESS_CONFIG.paymentLabelPaid : BUSINESS_CONFIG.paymentLabelPending}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Mes actual: {monthlySummary.monthClasses.length}/{BUSINESS_CONFIG.monthlyBaseClasses} clases • Extra: {monthlySummary.clasesExtra} (≈${monthlySummary.totalExtra.toLocaleString('es-CL')})
                      </p>
                      <FormInput
                        placeholder="Descripción breve de la clase (ej: respiración + escala de sol)"
                        value={classNotes[student.id] || ''}
                        onChange={(e) => setClassNotes(prev => ({ ...prev, [student.id]: e.target.value }))}
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Este texto aparece en el voucher para el apoderado.
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <FormInput
                          type="date"
                          value={classDates[student.id] || getTodayDateString()}
                          onChange={(e) => setClassDates(prev => ({ ...prev, [student.id]: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setClassDates(prev => ({ ...prev, [student.id]: getTodayDateString() }))}
                          className="px-2 py-1 text-[10px] rounded-full border border-border bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Hoy
                        </button>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {CLASS_NOTE_SUGGESTIONS.map((note) => (
                          <button
                            key={note}
                            type="button"
                            onClick={() => setClassNotes(prev => ({ ...prev, [student.id]: note }))}
                            className="px-2 py-0.5 text-[10px] rounded-full border border-border bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {note}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => registerClass(student)}
                          className="px-2.5 py-1 text-[11px] rounded-full border border-border bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          + Registrar clase
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLastClass(student)}
                          className="px-2.5 py-1 text-[11px] rounded-full border border-border bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Deshacer clase
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePaymentState(student)}
                          className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${
                            student.pagado
                              ? 'border-green-500/40 bg-green-500/10 text-green-600 hover:text-green-700'
                              : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-700 hover:text-yellow-800'
                          }`}
                        >
                          {student.pagado ? 'Marcar pendiente' : 'Marcar pagado'}
                        </button>
                        <button
                          type="button"
                          onClick={() => exportParentVoucher(student)}
                          className="px-2.5 py-1 text-[11px] rounded-full border border-border bg-muted/40 text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          Voucher apoderado
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => { setEditingId(student.id); setNewStudent({ nombre: student.nombre, apoderado: student.apoderado, instrumento: student.instrumento, profesor: student.profesor, aporte: student.aporte, aporteCustom: 0 }); }}
                        className="p-2 hover:bg-accent/20 text-accent rounded-md transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(student.id)}
                        className="p-2 hover:bg-red-500/20 text-red-500 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
            })
          )}
        </div>
      </div>
    </div>
  );
}
