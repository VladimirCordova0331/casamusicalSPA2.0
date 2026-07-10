import React from 'react';
import { FileText, Plus, Download, Trash2 } from 'lucide-react';
import { FormInput } from '../../ui/inputs/FormInput';
import { FormSelect } from '../../ui/inputs/FormSelect';
import { Documento } from '../../../utils/types';
import { BUSINESS_CONFIG } from '../../../config/business';

interface DocumentsModuleProps {
  documents?: Documento[];
  onAddDocument?: (doc: Omit<Documento, 'id'>) => void;
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

// Color de acento según tipo, para el badge en el documento impreso
const DOCUMENT_TYPE_COLORS: Record<string, string> = {
  contrato: '#3b82f6',
  recibo:   '#22c55e',
  factura:  '#a855f7',
  reporte:  '#f97316',
  acuerdo:  '#ec4899',
  otro:     '#6b7280',
};

const escapeHtml = (value: string) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

// Demo documents
const DEMO_DOCUMENTS: Documento[] = [
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
    tipo: 'otro' as Documento['tipo'],
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

  const handleDownload = (doc: Documento) => {
    const logoUrl = `${import.meta.env.BASE_URL}assets/casa-musical-logo.png`;
    const tipoLabel = DOCUMENT_TYPES.find(t => t.value === doc.tipo)?.label || doc.tipo;
    const tipoColor = DOCUMENT_TYPE_COLORS[doc.tipo] || DOCUMENT_TYPE_COLORS.otro;
    const fechaEmision = new Date().toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(doc.nombre)} | ${BUSINESS_CONFIG.legalName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', Arial, sans-serif;
      background: #FAF6EE;
      color: #1C1008;
      padding: 34px 38px;
      max-width: 860px;
      margin: 0 auto;
      position: relative;
      overflow: hidden;
    }
    .watermark {
      position: fixed;
      inset: 0;
      background: url('${logoUrl}') no-repeat center 56%;
      background-size: 340px;
      opacity: 0.04;
      pointer-events: none;
      z-index: 0;
    }
    .sheet { position: relative; z-index: 1; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #C9A227;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand img { width: 42px; height: 42px; object-fit: contain; filter: drop-shadow(0 1px 2px rgba(28,16,8,.12)); }
    .brand-title { font-family: 'Playfair Display', Georgia, serif; font-size: 23px; line-height: 1.05; color: #1C1008; }
    .brand-sub { font-size: 9px; letter-spacing: .22em; text-transform: uppercase; color: #8B7355; margin-top: 2px; }
    .doc-meta { text-align: right; font-size: 11px; color: #8B7355; }
    .doc-meta p + p { margin-top: 3px; }
    .card {
      background: #FFFCF5;
      border: 1px solid rgba(201,162,39,.3);
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 14px;
      box-shadow: 0 2px 8px rgba(28,16,8,.05);
    }
    .card-title {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #1C1008;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .type-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 99px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: .04em;
      background: ${tipoColor}22;
      color: ${tipoColor};
      border: 1px solid ${tipoColor}55;
    }
    .doc-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      color: #1C1008;
      margin-bottom: 14px;
    }
    .row {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 10px;
      padding: 9px 0;
      border-bottom: 1px solid rgba(139,115,85,.12);
    }
    .row:last-child { border-bottom: none; }
    .row-label { font-size: 11px; color: #8B7355; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; }
    .row-value { font-size: 13px; color: #1C1008; white-space: pre-wrap; }
    .footer {
      margin-top: 20px;
      padding-top: 11px;
      border-top: 1px solid rgba(139,115,85,.18);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #8B7355;
    }
    @media print {
      body { padding: 22px 26px; }
      @page { margin: 0.9cm 1cm; }
    }
  </style>
</head>
<body>
  <div class="watermark"></div>
  <main class="sheet">
  <header class="header">
    <div class="brand">
      <img src="${logoUrl}" alt="${BUSINESS_CONFIG.brandName}" />
      <div>
        <p class="brand-title">${BUSINESS_CONFIG.brandName}</p>
        <p class="brand-sub">Academia SPA</p>
      </div>
    </div>
    <div class="doc-meta">
      <p>Documento oficial</p>
      <p>Emitido: ${escapeHtml(fechaEmision)}</p>
    </div>
  </header>

  <section class="card">
    <h2 class="doc-name">${escapeHtml(doc.nombre || 'Documento sin nombre')}</h2>

    <div class="row">
      <p class="row-label">Tipo</p>
      <p class="row-value"><span class="type-badge">${escapeHtml(tipoLabel)}</span></p>
    </div>
    <div class="row">
      <p class="row-label">Fecha</p>
      <p class="row-value">${escapeHtml(doc.fecha || '-')}</p>
    </div>
    <div class="row">
      <p class="row-label">Descripción</p>
      <p class="row-value">${escapeHtml(doc.descripcion || 'Sin descripción')}</p>
    </div>
    <div class="row">
      <p class="row-label">Código interno</p>
      <p class="row-value">DOC-${doc.id}</p>
    </div>
  </section>

  <footer class="footer">
    <span>${BUSINESS_CONFIG.legalName}</span>
    <span>Solo uso interno</span>
  </footer>
  </main>

  <script>window.onload=()=>setTimeout(()=>window.print(),350)<\/script>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) {
      alert('Activa las ventanas emergentes para generar el documento.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
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
          <FormSelect
            label="Tipo"
            value={newDoc.tipo}
            onChange={(e) => setNewDoc({ ...newDoc, tipo: e.target.value as Documento['tipo'] })}
            options={DOCUMENT_TYPES}
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
                    onClick={() => handleDownload(doc)}
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
