import React from 'react';
import { GraduationCap, Plus, Pencil, Trash2 } from 'lucide-react';
import { Profesor } from '../../../utils/types';
import { FormInput } from '../../ui/inputs/FormInput';

interface TeacherModuleProps {
  professors: Profesor[];
  onAddProfessor: (prof: Omit<Profesor, 'id'>) => void;
  onEditProfessor: (id: number, updates: Partial<Profesor>) => void;
  onDeleteProfessor: (id: number) => void;
}

const INITIAL_PROFESSOR = {
  nombre: '',
  especialidad: '',
  valorHora: 15000,
};

export function TeacherModule({
  professors,
  onAddProfessor,
  onEditProfessor,
  onDeleteProfessor,
}: TeacherModuleProps) {
  const [newProf, setNewProf] = React.useState(INITIAL_PROFESSOR);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const handleAdd = React.useCallback(() => {
    if (!newProf.nombre.trim() || !newProf.especialidad.trim()) {
      alert('Por favor completa los campos');
      return;
    }

    onAddProfessor({
      nombre: newProf.nombre,
      especialidad: newProf.especialidad,
      valorHora: newProf.valorHora,
    });

    setNewProf(INITIAL_PROFESSOR);
  }, [newProf, onAddProfessor]);

  const totalProfesores = professors.length;
  const promedio = professors.length > 0
    ? (professors.reduce((sum, p) => sum + p.valorHora, 0) / professors.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Total Profesores</p>
          <p className="text-2xl font-bold text-foreground">{totalProfesores}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Valor Promedio/Hora</p>
          <p className="text-2xl font-bold text-accent">${(promedio / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Total Inversión/Hora</p>
          <p className="text-2xl font-bold text-orange-500">
            ${(professors.reduce((sum, p) => sum + p.valorHora, 0) / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Add Professor Form */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Agregar Profesor</h3>
        </div>
        <div className="space-y-2">
          <FormInput
            placeholder="Nombre completo"
            value={newProf.nombre}
            onChange={(e) => setNewProf({ ...newProf, nombre: e.target.value })}
            label="Nombre"
          />
          <FormInput
            placeholder="Ej: Guitarra, Piano, Violín, etc"
            value={newProf.especialidad}
            onChange={(e) => setNewProf({ ...newProf, especialidad: e.target.value })}
            label="Especialidad"
          />
          <FormInput
            type="number"
            placeholder="Valor por hora en CLP"
            value={newProf.valorHora || ''}
            onChange={(e) => setNewProf({ ...newProf, valorHora: Number(e.target.value) })}
            label="Valor Hora"
          />
        </div>
        <button
          onClick={handleAdd}
          className="w-full mt-3 bg-accent hover:bg-accent/80 text-accent-foreground font-semibold py-2 rounded-lg transition-colors"
        >
          Agregar Profesor
        </button>
      </div>

      {/* Professors List */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Profesores Registrados</h3>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {professors.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No hay profesores registrados</p>
          ) : (
            professors.map(prof => (
              <div key={prof.id} className="flex items-center justify-between bg-muted/40 p-3 rounded-lg hover:bg-muted/60 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{prof.nombre}</p>
                  <p className="text-xs text-muted-foreground">{prof.especialidad}</p>
                  <p className="text-xs text-accent font-medium mt-1">${prof.valorHora.toLocaleString('es-CL')}/hora</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => setEditingId(prof.id)}
                    className="p-2 hover:bg-accent/20 text-accent rounded-md transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteProfessor(prof.id)}
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

      {/* Tips */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p className="text-xs font-medium text-green-500">💡 Consejo</p>
        <p className="text-xs text-muted-foreground mt-1">
          Los profesores registrados aparecerán en la lista cuando agregues alumnos. Asigna un valor hora consistente para calcular correctamente los costos.
        </p>
      </div>
    </div>
  );
}
