import React from 'react';
import { Package, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { InventarioItem } from '../../../utils/types';
import { FormInput } from '../../ui/inputs/FormInput';
import { FormSelect } from '../../ui/inputs/FormSelect';

interface InventoryModuleProps {
  items: InventarioItem[];
  onAddItem: (item: Omit<InventarioItem, 'id'>) => void;
  onDeleteItem: (id: number) => void;
}

const ESTADO_OPTIONS = [
  { value: 'bueno', label: 'Bueno' },
  { value: 'regular', label: 'Regular' },
  { value: 'malo', label: 'Malo' },
];

const INITIAL_ITEM = {
  nombre: '',
  categoria: 'instrumentos',
  cantidad: 1,
  estado: 'bueno' as const,
  ubicacion: '',
};

export function InventoryModule({ items, onAddItem, onDeleteItem }: InventoryModuleProps) {
  const [newItem, setNewItem] = React.useState(INITIAL_ITEM);

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const itemsEnMal = items.filter(i => i.estado === 'malo').length;

  const handleAdd = React.useCallback(() => {
    if (!newItem.nombre.trim() || newItem.cantidad <= 0) {
      alert('Por favor completa los campos');
      return;
    }

    onAddItem({
      nombre: newItem.nombre,
      categoria: newItem.categoria,
      cantidad: newItem.cantidad,
      estado: newItem.estado,
      ubicacion: newItem.ubicacion,
    });

    setNewItem(INITIAL_ITEM);
  }, [newItem, onAddItem]);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Total Ítems</p>
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
      </div>

      {/* Add Item Form */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Agregar Ítem al Inventario</h3>
        </div>
        <div className="space-y-2">
          <FormInput
            placeholder="Nombre del instrumento/ítem"
            value={newItem.nombre}
            onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
            label="Nombre"
          />
          <FormInput
            placeholder="Ej: Sala de Música, Bodega, etc"
            value={newItem.ubicacion}
            onChange={(e) => setNewItem({ ...newItem, ubicacion: e.target.value })}
            label="Ubicación"
          />
          <FormInput
            type="number"
            placeholder="Cantidad disponible"
            value={newItem.cantidad || ''}
            onChange={(e) => setNewItem({ ...newItem, cantidad: Number(e.target.value) })}
            label="Cantidad"
          />
          <FormSelect
            label="Estado"
            value={newItem.estado}
            onChange={(e) => setNewItem({ ...newItem, estado: e.target.value as any })}
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

      {/* Inventory List */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Inventario</h3>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No hay ítems en inventario</p>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-muted/40 p-3 rounded-lg hover:bg-muted/60 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.ubicacion} • Cantidad: {item.cantidad}
                  </p>
                  <div className="mt-1">
                    {item.estado === 'bueno' && (
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">Bueno</span>
                    )}
                    {item.estado === 'regular' && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">Regular</span>
                    )}
                    {item.estado === 'malo' && (
                      <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Malo
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 hover:bg-red-500/20 text-red-500 rounded-md transition-colors ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
