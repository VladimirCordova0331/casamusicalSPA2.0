import React from 'react';
import { Users, Plus, Pencil, Trash2, Filter } from 'lucide-react';
import { Alumno } from '../../../utils/types';
import { FormInput } from '../../ui/inputs/FormInput';
import { FormSelect } from '../../ui/inputs/FormSelect';
import { SearchBar } from '../../ui/common/SearchBar';

interface StudentListProps {
  students: Alumno[];
  professors: string[];
  onAdd: (student: Omit<Alumno, 'id' | 'clases'>) => void;
  onEdit: (id: number, updates: Partial<Alumno>) => void;
  onDelete: (id: number) => void;
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

export function StudentModule({ students, professors, onAdd, onEdit, onDelete }: StudentListProps) {
  const [newStudent, setNewStudent] = React.useState<NewStudentForm>(INITIAL_STUDENT);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterInstrument, setFilterInstrument] = React.useState<string>('');
  const [filterProfessor, setFilterProfessor] = React.useState<string>('');

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

  const handleAddStudent = React.useCallback(() => {
    const nombre = newStudent.nombre.trim();
    const apoderado = newStudent.apoderado.trim();
    if (!nombre || !apoderado) {
      alert('Por favor completa nombre y apoderado');
      return;
    }

    const instrumento = (newStudent.instrumento || '').trim();
    if (!instrumento) {
      if (!confirm('No se indicó instrumento. ¿Deseas continuar sin instrumento?')) return;
    }

    const aporte = newStudent.aporte === 0 ? Number(newStudent.aporteCustom) : Number(newStudent.aporte);
    if (!aporte || aporte <= 0) {
      alert('El aporte debe ser mayor que 0');
      return;
    }

    const isDuplicate = students.some(s => s.nombre.toLowerCase() === nombre.toLowerCase() && s.apoderado.toLowerCase() === apoderado.toLowerCase());
    if (isDuplicate) {
      if (!confirm('Ya existe un alumno con ese nombre y apoderado. ¿Deseas agregar igualmente?')) return;
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
  }, [newStudent, onAdd, students]);

  const updateField = React.useCallback(<K extends keyof NewStudentForm>(
    field: K,
    value: NewStudentForm[K]
  ) => {
    setNewStudent(prev => ({ ...prev, [field]: value }));
  }, []);

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
          <FormSelect
            label="Profesor"
            value={newStudent.profesor}
            onChange={(e) => updateField('profesor', e.target.value)}
            options={professors.map(p => ({ value: p, label: p }))}
            placeholder="Selecciona un profesor"
          />
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
            filteredStudents.map(student => (
              <div key={student.id} className="flex items-center justify-between bg-muted/40 p-3 rounded-lg hover:bg-muted/60 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{student.nombre}</p>
                  <p className="text-xs text-muted-foreground">{student.instrumento} • {student.profesor}</p>
                  <p className="text-xs text-green-500 font-medium mt-1">${student.aporte.toLocaleString('es-CL')}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => setEditingId(student.id)}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
