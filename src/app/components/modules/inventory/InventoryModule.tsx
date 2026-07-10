import React from 'react';
import { Package, Plus, Trash2, AlertTriangle, Pencil, Search, Filter } from 'lucide-react';
import { InventarioItem } from '../../../utils/types';
import { FormInput } from '../../ui/inputs/FormInput';
import { FormSelect } from '../../ui/inputs/FormSelect';
import { SearchBar } from '../../ui/common/SearchBar';

interface InventoryModuleProps {
  items: InventarioItem[];
  onAddItem: (item: Omit<InventarioItem, 'id'>) => void;
  onEditItem?: (id: number, updates: Partial<InventarioItem>) => void;
  onDeleteItem: (id: number) => void;
  requestConfirm?: (msg: string) => Promise<boolean>;
}

const ESTADO_OPTIONS = [
  { value: 'bueno', label: 'Bueno' },
  { value: 'regular', label: 'Regular' },
  { value: 'malo', label: 'Malo' },
];

const CATEGORIA_OPTIONS = [
  { value: 'instrumentos', label: 'Instrumentos' },
  { value: 'equipamiento', label: 'Equipamiento' },
  { value: 'muebles', label: 'Muebles' },
  { value: 'materiales', label: 'Materiales' },
  { value: 'electronica', label: 'Electrónica' },
  { value: 'otros', label: 'Otros' },
];

const INITIAL_ITEM: Omit<InventarioItem, 'id'> = {
  nombre: '',
  categoria: 'instrumentos',
  cantidad: 1,
  estado: 'bueno',
  ubicacion: '',
};

const ESTADO_BADGE: Record<string, string> = {
  bueno: 'bg-green-500/20 text-green-500',
  regular: 'bg-yellow-500/20 text-yellow-500',
  malo: 'bg-red-500/20 text-red-500',
};

export function InventoryModule({ items, onAddItem, onEditItem, onDeleteItem, requestConfirm }: InventoryModuleProps) {
  const [newItem, setNewItem] = React.useState<Omit<InventarioItem, 'id'>>(INITIAL_ITEM);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editItem, setEditItem] = React.useState<Omit<InventarioItem, 'id'> | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterEstado, setFilterEstado] = React.useState('');
  const [filterCategoria, setFilterCategoria] = React.useState('');

  const filteredItems = React.useMemo(() => {
    return items.filter(item => {
      const matchesSearch =
        item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ubicacion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoria.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEstado = !filterEstado || item.estado === filterEstado;
      const matchesCategoria = !filterCategoria || item.categoria === filterCategoria;
      return matchesSearch && matchesEstado && matchesCategoria;
    });
  }, [items, searchQuery, filterEstado, filterCategoria]);

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const itemsEnMal = items.filter(i => i.estado === 'malo').length;
  const itemsEnRegular = items.filter(i => i.estado === 'regular').length;

  const handleAdd = React.useCallback(() => {
    if (!newItem.nombre.trim() || newItem.cantidad <= 0) {
      alert('Por favor completa los campos obligatorios');
      return;
    }
    onAddItem({ ...newItem, nombre: newItem.nombre.trim() });
    setNewItem(INITIAL_ITEM);
  }, [newItem, onAddItem]);

  const handleDelete = React.useCallback(async (id: number) => {
    const ok = requestConfirm
      ? await requestConfirm('¿Eliminar este ítem del inventario? Esta acción no se puede deshacer.')
      : confirm('¿Eliminar este ítem del inventario?');
    if (!ok) return;
    onDeleteItem(id);
  }, [onDeleteItem, requestConfirm]);

  const startEdit = (item: InventarioItem) => {
    setEditingId(item.id);
    setEditItem({ nombre: item.nombre, categoria: item.categoria, cantidad: item.cantidad, estado: item.estado, ubicacion: item.ubicacion });
  };

  const saveEdit = (id: number) => {
    if (!editItem || !editItem.nombre.trim()) { alert('El nombre es obligatorio'); return; }
    onEditItem?.(id, editItem);
    setEditingId(null);
    setEditItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Total Unidades</p>
          <p className="text-2xl font-bold text-foreground">{totalItems}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Registros</p>
          <p className="text-2xl font-bold text-accent">{items.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">En mal estado</p>
          <p className="text-2xl font-bold text-red-500">{itemsEnMal}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Estado regular</p>
          <p className="text-2xl font-bold text-yellow-500">{itemsEnRegular}</p>
        </div>
      </div>

      {/* Alert for bad-state items */}
      {itemsEnMal > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-500 font-medium">
            {itemsEnMal} ítem(s) en mal estado requieren atención o reemplazo.
          </p>
        </div>
      )}

      {/* Add Item Form */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Agregar Ítem al Inventario</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FormInput
            placeholder="Nombre del instrumento/ítem"
            value={newItem.nombre}
            onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
            label="Nombre *"
          />
          <FormInput
            placeholder="Ej: Sala de Música, Bodega"
            value={newItem.ubicacion}
            onChange={(e) => setNewItem({ ...newItem, ubicacion: e.target.value })}
            label="Ubicación"
          />
          <FormSelect
            label="Categoría"
            value={newItem.categoria}
            onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
            options={CATEGORIA_OPTIONS}
          />
          <FormInput
            type="number"
            placeholder="Cantidad"
            value={newItem.cantidad || ''}
            onChange={(e) => setNewItem({ ...newItem, cantidad: Number(e.target.value) })}
            label="Cantidad *"
          />
          <FormSelect
            label="Estado"
            value={newItem.estado}
            onChange={(e) => setNewItem({ ...newItem, estado: e.target.value as InventarioItem['estado'] })}
            options={ESTADO_OPTIONS}
          />
        </div>
        <button
          onClick={handleAdd}
          className="w-full mt-3 bg-accent hover:bg-accent/80 text-accent-foreground font-semibold py-2 rounded-lg transition-colors"
        >
          Agregar Ítem
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-card border border-border rounded-xl p-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-[160px]">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar por nombre, categoría o ubicación" />
          </div>
          <FormSelect
            label="Estado"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            options={[{ value: '', label: 'Todos' }, ...ESTADO_OPTIONS]}
          />
          <FormSelect
            label="Categoría"
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            options={[{ value: '', label: 'Todas' }, ...CATEGORIA_OPTIONS]}
          />
          {(searchQuery || filterEstado || filterCategoria) && (
            <button
              onClick={() => { setSearchQuery(''); setFilterEstado(''); setFilterCategoria(''); }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Inventario</h3>
          <span className="text-xs text-muted-foreground ml-2">({filteredItems.length} de {items.length})</span>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              {items.length === 0 ? 'No hay ítems en inventario' : 'No hay ítems que coincidan con los filtros'}
            </p>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="bg-muted/40 p-3 rounded-lg hover:bg-muted/60 transition-colors">
                {editingId === item.id && editItem ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <FormInput value={editItem.nombre} onChange={(e) => setEditItem({ ...editItem, nombre: e.target.value })} label="Nombre" />
                      <FormInput value={editItem.ubicacion} onChange={(e) => setEditItem({ ...editItem, ubicacion: e.target.value })} label="Ubicación" />
                      <FormSelect label="Categoría" value={editItem.categoria} onChange={(e) => setEditItem({ ...editItem, categoria: e.target.value })} options={CATEGORIA_OPTIONS} />
                      <FormInput type="number" value={String(editItem.cantidad)} onChange={(e) => setEditItem({ ...editItem, cantidad: Number(e.target.value) })} label="Cantidad" />
                      <FormSelect label="Estado" value={editItem.estado} onChange={(e) => setEditItem({ ...editItem, estado: e.target.value as InventarioItem['estado'] })} options={ESTADO_OPTIONS} />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => saveEdit(item.id)} className="px-3 py-2 bg-accent text-accent-foreground rounded-md text-sm">Guardar</button>
                      <button onClick={() => { setEditingId(null); setEditItem(null); }} className="px-3 py-2 bg-muted text-foreground rounded-md text-sm">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground truncate">{item.nombre}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${ESTADO_BADGE[item.estado] || ESTADO_BADGE.bueno}`}>
                          {item.estado === 'malo' && <AlertTriangle className="inline w-2.5 h-2.5 mr-1" />}
                          {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {CATEGORIA_OPTIONS.find(c => c.value === item.categoria)?.label || item.categoria}
                        {item.ubicacion ? ` • ${item.ubicacion}` : ''}
                        {' • '}x{item.cantidad}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2 shrink-0">
                      {onEditItem && (
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2 hover:bg-accent/20 text-accent rounded-md transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-red-500/20 text-red-500 rounded-md transition-colors"
                        title="Eliminar"
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

      {/* Category breakdown */}
      {items.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-accent" /> Resumen por Categoría
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIA_OPTIONS.map(cat => {
              const catItems = items.filter(i => i.categoria === cat.value);
              if (catItems.length === 0) return null;
              return (
                <div key={cat.value} className="bg-muted/40 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">{cat.label}</p>
                  <p className="text-lg font-bold text-foreground">{catItems.reduce((s, i) => s + i.cantidad, 0)}</p>
                  <p className="text-xs text-muted-foreground">{catItems.length} registro(s)</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
