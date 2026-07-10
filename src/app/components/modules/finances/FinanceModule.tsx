import React from 'react';
import { Wallet, Plus, Trash2, Pencil } from 'lucide-react';
import { SearchBar } from '../../ui/common/SearchBar';
import { Gasto } from '../../../utils/types';
import { FormInput } from '../../ui/inputs/FormInput';
import { FormSelect } from '../../ui/inputs/FormSelect';

interface FinanceModuleProps {
  gastos: Gasto[];
  onAddGasto: (gasto: Omit<Gasto, 'id'>) => void;
  onEditGasto?: (id: number, updates: Partial<Gasto>) => void;
  onDeleteGasto: (id: number) => void;
  requestConfirm?: (message: string) => Promise<boolean>;
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

export function FinanceModule({ gastos, onAddGasto, onDeleteGasto, requestConfirm }: FinanceModuleProps) {
  const [newGasto, setNewGasto] = React.useState(INITIAL_GASTO);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState('');

  const filteredGastos = React.useMemo(() => {
    return gastos.filter(g => {
      const matchesSearch = g.concepto.toLowerCase().includes(searchQuery.toLowerCase()) || g.categoria.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filterCategory || g.categoria === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [gastos, searchQuery, filterCategory]);

  const totalGastos = filteredGastos.reduce((s, g) => s + g.monto, 0);
  const gastosPorCategoria = CATEGORIES.map(cat => ({
    ...cat,
    total: filteredGastos
      .filter(g => g.categoria === cat.value)
      .reduce((s, g) => s + g.monto, 0),
  }));

  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editGasto, setEditGasto] = React.useState<Omit<Gasto, 'id'> | null>(null);

  const handleAdd = React.useCallback(async () => {
    if (!newGasto.concepto.trim() || newGasto.monto <= 0) {
      alert('Por favor completa los campos');
      return;
    }

    const concepto = newGasto.concepto.trim();
    const monto = Number(newGasto.monto);
    const fecha = newGasto.fecha;

    const duplicate = gastos.some(g => g.concepto.toLowerCase() === concepto.toLowerCase() && g.monto === monto && g.fecha === fecha);
    if (duplicate) {
      const ok = requestConfirm ? await requestConfirm('Ya existe un gasto idéntico (concepto, monto y fecha). ¿Deseas agregarlo igualmente?') : confirm('Ya existe un gasto idéntico (concepto, monto y fecha). ¿Deseas agregarlo igualmente?');
      if (!ok) return;
    }

    onAddGasto({
      concepto,
      categoria: newGasto.categoria,
      monto,
      fecha,
      automatico: newGasto.automatico,
    });

    setNewGasto(INITIAL_GASTO);
  }, [newGasto, onAddGasto, gastos, requestConfirm]);

  const exportGastosCSV = React.useCallback(() => {
    if (!filteredGastos || filteredGastos.length === 0) {
      alert('No hay gastos para exportar');
      return;
    }

    const header = ['Concepto', 'Categoría', 'Monto', 'Fecha', 'Automático'];
    const rows = filteredGastos.map(g => [
      '"' + g.concepto.replace(/"/g, '""') + '"',
      g.categoria,
      g.monto,
      g.fecha,
      g.automatico ? 'Sí' : 'No'
    ].join(','));

    const csv = [header.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }, [filteredGastos]);

  const exportGastosPDF = React.useCallback(() => {
    if (!filteredGastos || filteredGastos.length === 0) {
      alert('No hay gastos para exportar');
      return;
    }

    const title = 'Reporte de Gastos - ' + new Date().toLocaleDateString();
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
        th { background: #f3f4f6; }
      </style>
    `;

    const rows = filteredGastos.map(g => `
      <tr>
        <td>${escapeHtml(g.concepto)}</td>
        <td>${escapeHtml(g.categoria)}</td>
        <td style="text-align:right">${g.monto.toLocaleString('es-CL')}</td>
        <td>${g.fecha}</td>
        <td style="text-align:center">${g.automatico ? 'Sí' : 'No'}</td>
      </tr>
    `).join('');

    const html = `<!doctype html><html><head><meta charset="utf-8">${styles}</head><body>
      <h1>${title}</h1>
      <table>
        <thead>
          <tr><th>Concepto</th><th>Categoría</th><th>Monto</th><th>Fecha</th><th>Automático</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>`;

    const win = window.open('', '_blank');
    if (!win) {
      alert('No se puede abrir ventana para imprimir. Revisa tu bloqueador de pop-ups.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    // Esperar que el contenido cargue
    setTimeout(() => { win.print(); }, 500);
  }, [filteredGastos]);

  // helper to escape HTML
  function escapeHtml(str: string) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

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
          <div className="mt-4 flex items-center gap-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar concepto o categoría" />
            <FormSelect
              label="Filtrar categoría"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={[{ value: '', label: 'Todas' }, ...CATEGORIES]}
            />
            <button
              onClick={exportGastosCSV}
              className="ml-2 inline-flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md text-sm"
              title="Exportar gastos filtrados a CSV"
            >
              Exportar CSV
            </button>
            <button
              onClick={exportGastosPDF}
              className="ml-2 inline-flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/90 text-foreground rounded-md text-sm border border-border"
              title="Exportar gastos filtrados a PDF (abrirá ventana para imprimir)"
            >
              Exportar PDF
            </button>
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
          {filteredGastos.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No hay gastos registrados</p>
          ) : (
            filteredGastos.slice().reverse().map(gasto => (
              <div key={gasto.id} className="bg-muted/40 p-3 rounded-lg hover:bg-muted/60 transition-colors">
                {editingId === gasto.id ? (
                  <div className="space-y-2">
                    <FormInput value={editGasto?.concepto || gasto.concepto} onChange={(e) => setEditGasto(prev => ({ ...(prev || gasto), concepto: e.target.value }))} label="Concepto" />
                    <FormSelect label="Categoría" value={editGasto?.categoria || gasto.categoria} onChange={(e) => setEditGasto(prev => ({ ...(prev || gasto), categoria: e.target.value }))} options={CATEGORIES} />
                    <FormInput type="number" value={String(editGasto?.monto ?? gasto.monto)} onChange={(e) => setEditGasto(prev => ({ ...(prev || gasto), monto: Number(e.target.value) }))} label="Monto" />
                    <FormInput type="date" value={editGasto?.fecha || gasto.fecha} onChange={(e) => setEditGasto(prev => ({ ...(prev || gasto), fecha: e.target.value }))} label="Fecha" />
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!(editGasto?.automatico ?? gasto.automatico)} onChange={(e) => setEditGasto(prev => ({ ...(prev || gasto), automatico: e.target.checked }))} />
                        <span className="text-xs">Automático</span>
                      </label>
                      <div className="ml-auto flex gap-2">
                        <button onClick={() => {
                          if (!editGasto) return;
                          if (!editGasto.concepto.trim() || !editGasto.monto || editGasto.monto <= 0) { alert('Concepto y monto válidos son requeridos'); return; }
                          onEditGasto?.(gasto.id, editGasto);
                          setEditingId(null);
                          setEditGasto(null);
                        }} className="px-3 py-2 bg-accent text-accent-foreground rounded-md">Guardar</button>
                        <button onClick={() => { setEditingId(null); setEditGasto(null); }} className="px-3 py-2 bg-muted text-foreground rounded-md">Cancelar</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{gasto.concepto}</p>
                      <p className="text-xs text-muted-foreground">{gasto.categoria} • {gasto.fecha}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <p className="text-sm font-bold text-red-500">${gasto.monto.toLocaleString('es-CL')}</p>
                      <button onClick={() => { setEditingId(gasto.id); setEditGasto({ concepto: gasto.concepto, categoria: gasto.categoria, monto: gasto.monto, fecha: gasto.fecha, automatico: gasto.automatico }); }} className="p-1.5 hover:bg-accent/20 text-accent rounded-md transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteGasto(gasto.id)}
                        className="p-1.5 hover:bg-red-500/20 text-red-500 rounded-md transition-colors"
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
    </div>
  );
}
