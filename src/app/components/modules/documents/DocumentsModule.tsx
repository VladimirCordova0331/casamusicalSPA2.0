import React from 'react';
import { FileText, Plus, Download, Trash2 } from 'lucide-react';
import { FormInput } from '../../ui/inputs/FormInput';

interface Document {
  id: number;
  nombre: string;
  tipo: string;
  fecha: string;
  descripcion: string;
}

interface DocumentsModuleProps {
  documents?: Document[];
  onAddDocument?: (doc: Omit<Document, 'id'>) => void;
  onDeleteDocument?: (id: number) => void;
}

const DOCUMENT_TYPES = [
  { value: 'contrato', label: 'Contrato' },
  { value: 'recibo', label: 'Recibo' },
  { value: 'factura', label: 'Factura' },
  { value: 'reporte', label: 'Reporte' },
  { value: 'acuerdo', label: 'Acuerdo' },
  { value: 'otro', label: 'Otro' },
];

// Demo documents
const DEMO_DOCUMENTS: Document[] = [
  {
    id: 1,
    nombre: 'Contrato Profesor García',
    tipo: 'contrato',
    fecha: '2024-01-15',
    descripcion: 'Contrato de trabajo profesor de guitarra',
  },
  {
    id: 2,
    nombre: 'Acuerdo Grupo Familiar González',
    tipo: 'acuerdo',
    fecha: '2024-02-01',
    descripcion: 'Acuerdo de descuento grupo familiar',
  },
  {
    id: 3,
    nombre: 'Reporte Mensual Enero',
    tipo: 'reporte',
    fecha: '2024-02-05',
    descripcion: 'Reporte de actividades y finanzas enero 2024',
  },
];

export function DocumentsModule({
  documents = DEMO_DOCUMENTS,
  onAddDocument = () => {},
  onDeleteDocument = () => {},
}: DocumentsModuleProps) {
  const [newDoc, setNewDoc] = React.useState({
    nombre: '',
    tipo: 'otro',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
  });

  const handleAdd = React.useCallback(() => {
    if (!newDoc.nombre.trim()) {
      alert('Por favor ingresa nombre del documento');
      return;
    }

    onAddDocument({
      nombre: newDoc.nombre,
      tipo: newDoc.tipo,
      fecha: newDoc.fecha,
      descripcion: newDoc.descripcion,
    });

    setNewDoc({
      nombre: '',
      tipo: 'otro',
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
    });
  }, [newDoc, onAddDocument]);

  const handleDownload = (docName: string) => {
    // Simular descarga
    alert(`📥 Descargando: ${docName}`);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      contrato: 'bg-blue-500/20 text-blue-500',
      recibo: 'bg-green-500/20 text-green-500',
      factura: 'bg-purple-500/20 text-purple-500',
      reporte: 'bg-orange-500/20 text-orange-500',
      acuerdo: 'bg-pink-500/20 text-pink-500',
      otro: 'bg-gray-500/20 text-gray-500',
    };
    return colors[type] || colors.otro;
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Total Documentos</p>
          <p className="text-2xl font-bold text-foreground">{documents.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Contratos</p>
          <p className="text-2xl font-bold text-accent">
            {documents.filter(d => d.tipo === 'contrato').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Reportes</p>
          <p className="text-2xl font-bold text-orange-500">
            {documents.filter(d => d.tipo === 'reporte').length}
          </p>
        </div>
      </div>

      {/* Add Document Form */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Agregar Documento</h3>
        </div>
        <div className="space-y-2">
          <FormInput
            placeholder="Nombre del documento"
            value={newDoc.nombre}
            onChange={(e) => setNewDoc({ ...newDoc, nombre: e.target.value })}
            label="Nombre"
          />
          <FormInput
            placeholder="Descripción o detalles"
            value={newDoc.descripcion}
            onChange={(e) => setNewDoc({ ...newDoc, descripcion: e.target.value })}
            label="Descripción"
          />
          <FormInput
            type="date"
            value={newDoc.fecha}
            onChange={(e) => setNewDoc({ ...newDoc, fecha: e.target.value })}
            label="Fecha"
          />
        </div>
        <button
          onClick={handleAdd}
          className="w-full mt-3 bg-accent hover:bg-accent/80 text-accent-foreground font-semibold py-2 rounded-lg transition-colors"
        >
          Agregar Documento
        </button>
      </div>

      {/* Documents List */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Documentos Guardados</h3>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {documents.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No hay documentos</p>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="flex items-start justify-between bg-muted/40 p-3 rounded-lg hover:bg-muted/60 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">{doc.nombre}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{doc.descripcion}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${getTypeColor(doc.tipo)}`}>
                      {DOCUMENT_TYPES.find(t => t.value === doc.tipo)?.label || doc.tipo}
                    </span>
                    <span className="text-xs text-muted-foreground">{doc.fecha}</span>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => handleDownload(doc.nombre)}
                    className="p-1.5 hover:bg-green-500/20 text-green-500 rounded-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
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

      {/* Quick Tip */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs font-medium text-blue-500">💡 Tip</p>
        <p className="text-xs text-muted-foreground mt-1">
          Guarda aquí todos los documentos importantes: contratos, acuerdos, reportes y facturas. Los puedes descargar cuando los necesites.
        </p>
      </div>
    </div>
  );
}
