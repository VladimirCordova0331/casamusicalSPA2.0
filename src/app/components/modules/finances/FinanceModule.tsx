import React from 'react';
import { Wallet, Plus, Trash2 } from 'lucide-react';
import { Gasto } from '../../utils/types';
import { FormInput } from '../ui/inputs/FormInput';
import { FormSelect } from '../ui/inputs/FormSelect';

interface FinanceModuleProps {
  gastos: Gasto[];
  onAddGasto: (gasto: Omit<Gasto, 'id'>) => void;
  onDeleteGasto: (id: number) => void;
}

const CATEGORIES = [
  { value: 'sueldos', label: 'Sueldos' },
  { value: 'contabilidad', label: 'Contabilidad' },
  { value: 'material', label: 'Material' },
  { value: 'instrumentos', label: 'Instrumentos' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'insumos', label: 'Insumos' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'arriendo', label: 'Arriendo' },
  { value: 'otros', label: 'Otros' },
];

const INITIAL_GASTO = {
  concepto: '',
  categoria: 'otros',
  monto: 0,
  fecha: new Date().toISOString().split('T')[0],
  automatico: false,
};

export function FinanceModule({ gastos, onAddGasto, onDeleteGasto }: FinanceModuleProps) {
  const [newGasto, setNewGasto] = React.useState(INITIAL_GASTO);

  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0);
  const gastosPorCategoria = CATEGORIES.map(cat => ({
    ...cat,
    total: gastos
      .filter(g => g.categoria === cat.value)
      .reduce((s, g) => s + g.monto, 0),
  }));

  const handleAdd = React.useCallback(() => {
    if (!newGasto.concepto.trim() || newGasto.monto <= 0) {
      alert('Por favor completa los campos');
      return;
    }

    onAddGasto({
      concepto: newGasto.concepto,
      categoria: newGasto.categoria,
      monto: newGasto.monto,
      fecha: newGasto.fecha,
      automatico: newGasto.automatico,
    });

    setNewGasto(INITIAL_GASTO);
  }, [newGasto, onAddGasto]);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Total Gastos</p>
          <p className="text-2xl font-bold text-red-500">${(totalGastos / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Promedio</p>
          <p className="text-2xl font-bold text-accent">
            ${gastos.length > 0 ? ((totalGastos / gastos.length) / 1000).toFixed(0) : 0}K
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Registros</p>
          <p className="text-2xl font-bold text-foreground">{gastos.length}</p>
        </div>
      </div>

      {/* Add Gasto Form */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Registrar Gasto</h3>
        </div>
        <div className="space-y-2">
          <FormInput
            placeholder="Concepto del gasto"
            value={newGasto.concepto}
            onChange={(e) => setNewGasto({ ...newGasto, concepto: e.target.value })}
            label="Concepto"
          />
          <FormSelect
            label="Categoría"
            value={newGasto.categoria}
            onChange={(e) => setNewGasto({ ...newGasto, categoria: e.target.value })}
            options={CATEGORIES}
          />
          <FormInput
            type="number"
            placeholder="Monto en CLP"
            value={newGasto.monto || ''}
            onChange={(e) => setNewGasto({ ...newGasto, monto: Number(e.target.value) })}
            label="Monto"
          />
          <FormInput
            type="date"
            value={newGasto.fecha}
            onChange={(e) => setNewGasto({ ...newGasto, fecha: e.target.value })}
            label="Fecha"
          />
        </div>
        <button
          onClick={handleAdd}
          className="w-full mt-3 bg-accent hover:bg-accent/80 text-accent-foreground font-semibold py-2 rounded-lg transition-colors"
        >
          Registrar Gasto
        </button>
      </div>

      {/* Categories Breakdown */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Gastos por Categoría</h3>
        <div className="space-y-2">
          {gastosPorCategoria.map(cat => (
            cat.total > 0 && (
              <div key={cat.value} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{cat.label}</span>
                <span className="text-xs font-semibold text-foreground">${(cat.total / 1000).toFixed(0)}K</span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Gastos List */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Últimos Gastos</h3>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {gastos.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No hay gastos registrados</p>
          ) : (
            gastos.slice().reverse().map(gasto => (
              <div key={gasto.id} className="flex items-center justify-between bg-muted/40 p-3 rounded-lg hover:bg-muted/60 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{gasto.concepto}</p>
                  <p className="text-xs text-muted-foreground">{gasto.categoria} • {gasto.fecha}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <p className="text-sm font-bold text-red-500">${gasto.monto.toLocaleString('es-CL')}</p>
                  <button
                    onClick={() => onDeleteGasto(gasto.id)}
                    className="p-1.5 hover:bg-red-500/20 text-red-500 rounded-md transition-colors"
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
