import React from 'react';
import { Users, Plus, Pencil, Trash2 } from 'lucide-react';
import { Alumno } from '../../utils/types';
import { FormInput } from '../ui/inputs/FormInput';
import { FormSelect } from '../ui/inputs/FormSelect';

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

  const handleAddStudent = React.useCallback(() => {
    if (!newStudent.nombre.trim() || !newStudent.apoderado.trim()) {
      alert('Por favor completa nombre y apoderado');
      return;
    }

    onAdd({
      nombre: newStudent.nombre,
      apoderado: newStudent.apoderado,
      instrumento: newStudent.instrumento,
      profesor: newStudent.profesor,
      aporte: newStudent.aporte === 0 ? newStudent.aporteCustom : newStudent.aporte,
      modalidad: 'individual',
      grupoFamiliar: false,
    });

    setNewStudent(INITIAL_STUDENT);
  }, [newStudent, onAdd]);

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
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Alumnos Registrados</h3>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {students.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No hay alumnos registrados</p>
          ) : (
            students.map(student => (
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
