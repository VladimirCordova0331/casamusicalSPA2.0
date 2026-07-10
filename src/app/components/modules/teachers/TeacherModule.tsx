import React from 'react';
import { GraduationCap, Plus, Pencil, Trash2 } from 'lucide-react';
import { SearchBar } from '../../ui/common/SearchBar';
import { Profesor } from '../../../utils/types';
import { FormInput } from '../../ui/inputs/FormInput';
import { FormSelect } from '../../ui/inputs/FormSelect';

interface TeacherModuleProps {
  professors: Profesor[];
  onAddProfessor: (prof: Omit<Profesor, 'id'>) => void;
  onEditProfessor: (id: number, updates: Partial<Profesor>) => void;
  onDeleteProfessor: (id: number) => void;
  requestConfirm?: (message: string) => Promise<boolean>;
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
  requestConfirm,
}: TeacherModuleProps) {
  try {
  const [newProf, setNewProf] = React.useState(INITIAL_PROFESSOR);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterEspecialidad, setFilterEspecialidad] = React.useState('');

  const especialidades = Array.from(new Set(professors.map(p => p.especialidad))).filter(Boolean);

  // filtered
  const filteredProfessors = React.useMemo(() => {
    return professors.filter(prof => {
      const matchesSearch = prof.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || prof.especialidad.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEspecialidad = !filterEspecialidad || prof.especialidad === filterEspecialidad;
      return matchesSearch && matchesEspecialidad;
    });
  }, [professors, searchQuery, filterEspecialidad]);

  const handleAdd = React.useCallback(async () => {
    const nombre = (newProf.nombre || '').trim();
    const especialidad = (newProf.especialidad || '').trim();
    if (!nombre || !especialidad) {
      alert('Por favor completa los campos');
      return;
    }

    const valorHora = Number(newProf.valorHora) || 0;
    if (valorHora <= 0) {
      alert('El valor por hora debe ser mayor que 0');
      return;
    }

    const isDuplicate = professors.some(p => p.nombre.toLowerCase() === nombre.toLowerCase());
    if (isDuplicate) {
      const ok = requestConfirm ? await requestConfirm('Ya existe un profesor con ese nombre. ¿Deseas agregar igualmente?') : confirm('Ya existe un profesor con ese nombre. ¿Deseas agregar igualmente?');
      if (!ok) return;
    }

    onAddProfessor({
      nombre,
      especialidad,
      valorHora,
    });

    setNewProf(INITIAL_PROFESSOR);
  }, [newProf, onAddProfessor, professors, requestConfirm]);

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold">Profesores Registrados</h3>
            <span className="text-xs text-muted-foreground ml-2">({filteredProfessors.length})</span>
          </div>

          <div className="flex gap-2 items-center w-1/2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar por nombre o especialidad" />
            <FormSelect
              label="Especialidad"
              value={filterEspecialidad}
              onChange={(e) => setFilterEspecialidad(e.target.value)}
              options={[{ value: '', label: 'Todas' }, ...especialidades.map(s => ({ value: s, label: s }))]}
            />
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredProfessors.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No hay profesores que coincidan</p>
          ) : (
            filteredProfessors.map(prof => (
              <div key={prof.id} className="bg-muted/40 p-3 rounded-lg hover:bg-muted/60 transition-colors">
                {editingId === prof.id ? (
                  <div className="space-y-2">
                    <FormInput value={newProf.nombre} onChange={(e)=> setNewProf(prev=>({...prev, nombre: e.target.value}))} label="Nombre" />
                    <FormInput value={newProf.especialidad} onChange={(e)=> setNewProf(prev=>({...prev, especialidad: e.target.value}))} label="Especialidad" />
                    <FormInput type="number" value={newProf.valorHora || ''} onChange={(e)=> setNewProf(prev=>({...prev, valorHora: Number(e.target.value)}))} label="Valor Hora" />
                    <div className="flex gap-2">
                      <button onClick={() => {
                        const updates = { nombre: newProf.nombre || prof.nombre, especialidad: newProf.especialidad || prof.especialidad, valorHora: Number(newProf.valorHora) || prof.valorHora };
                        onEditProfessor(prof.id, updates);
                        setEditingId(null);
                        setNewProf(INITIAL_PROFESSOR);
                      }} className="px-3 py-2 bg-accent text-accent-foreground rounded-md">Guardar</button>
                      <button onClick={() => { setEditingId(null); setNewProf(INITIAL_PROFESSOR); }} className="px-3 py-2 bg-muted text-foreground rounded-md">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{prof.nombre}</p>
                      <p className="text-xs text-muted-foreground">{prof.especialidad}</p>
                      <p className="text-xs text-accent font-medium mt-1">${prof.valorHora.toLocaleString('es-CL')}/hora</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => { setEditingId(prof.id); setNewProf({ nombre: prof.nombre, especialidad: prof.especialidad, valorHora: prof.valorHora }); }}
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
                )}
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
  } catch (err) {
    console.error('TeacherModule render error:', err);
    return (
      <div className="bg-card border border-red-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-red-600">Error cargando módulo Profesores</p>
        <pre className="text-xs text-muted-foreground mt-2">{String(err)}</pre>
      </div>
    );
  }
}
