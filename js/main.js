// ============================================
// CASA MUSICAL ACADEMIA SPA - JAVASCRIPT
// ============================================

const { createApp, ref, computed, watch, onMounted } = Vue;

const app = createApp({
    setup() {
        const currentTab = ref('alumnos');
        const isDarkMode = ref(false);
        const toastVisible = ref(false);
        const toastMessage = ref('');

        // ===== ALUMNOS =====
        const alumnos = ref([]);
        const nuevoAlumno = ref({
            nombre: '',
            apoderado: '',
            instrumento: '',
            profesor: '',
            aporte: '100000',
            aporteCustom: '',
            modalidad: 'academia',
            grupoFamiliar: '',
            clases: []
        });
        const alumnoSeleccionado = ref(null);
        const nuevaClase = ref({ fecha: new Date().toISOString().slice(0, 10), contenido: '' });
        const mesesAbiertos = ref({});

        // ===== PROFESORES =====
        const profesores = ref([]);
        const nuevoProfesor = ref({ nombre: '', especialidad: '', valorHora: '' });

        // ===== GASTOS =====
        const gastos = ref([]);
        const nuevoGasto = ref({ concepto: '', categoria: 'servicios', monto: '', fecha: new Date().toISOString().slice(0, 10), comprobante: '' });
        const categoriasAbiertas = ref({});

        // ===== INVENTARIO =====
        const inventario = ref([]);
        const nuevoInventario = ref({ nombre: '', categoria: '', cantidad: 1, estado: 'bueno', ubicacion: '' });
        const comprasPendientes = ref([]);
        const nuevaCompra = ref({ nombre: '', prioridad: 'media', nota: '' });

        // ===== DOCUMENTOS =====
        const ultimoDocumento = ref('');
        const documentoAlumnoId = ref('');
        const informeContador = ref('');

        // ===== MODALES =====
        const modalVisible = ref(false);
        const modalTitulo = ref('');
        const modalTipo = ref('');
        const modalIndex = ref(null);
        const modalDatos = ref({});
        const modalCampos = ref({});
        const modalGrupoVisible = ref(false);
        const modalGrupoTitulo = ref('');
        const modalGrupoIndex = ref(null);
        const modalGrupoDatos = ref({ nombre: '', miembros: [], descuento: 0 });

        // ===== TABS =====
        const tabs = [
            { id: 'alumnos', label: 'Alumnos', icon: '👨‍🎓' },
            { id: 'profesores', label: 'Profesores', icon: '👩‍🏫' },
            { id: 'caja', label: 'Flujo de Caja', icon: '💰' },
            { id: 'inventario', label: 'Inventario', icon: '📦' },
            { id: 'crecimiento', label: 'Crecimiento', icon: '📈' },
            { id: 'documentos', label: 'Documentos', icon: '📄' }
        ];

        // ===== DATOS INICIALES =====
        const datosIniciales = [
            { nombre: 'Aurora', apoderado: 'Carolina', instrumento: 'Flauta', profesor: 'Carolina', aporte: 100000, modalidad: 'academia', grupoFamiliar: '', clases: [] },
            { nombre: 'Eloísa', apoderado: 'Carolina', instrumento: 'Piano', profesor: 'Carolina', aporte: 100000, modalidad: 'academia', grupoFamiliar: '', clases: [] },
            { nombre: 'José', apoderado: 'Carolina', instrumento: 'Guitarra', profesor: 'Carolina', aporte: 100000, modalidad: 'academia', grupoFamiliar: '', clases: [] },
            { nombre: 'Maia', apoderado: 'Carolina', instrumento: 'Violín', profesor: 'Carolina', aporte: 100000, modalidad: 'academia', grupoFamiliar: '', clases: [] },
            { nombre: 'Manuel', apoderado: 'Carolina', instrumento: 'Batería', profesor: 'Carolina', aporte: 100000, modalidad: 'academia', grupoFamiliar: '', clases: [] },
            { nombre: 'Renata', apoderado: 'Carolina', instrumento: 'Canto', profesor: 'Carolina', aporte: 100000, modalidad: 'academia', grupoFamiliar: '', clases: [] },
            { nombre: 'Sara', apoderado: 'Carolina', instrumento: 'Flauta', profesor: 'Carolina', aporte: 100000, modalidad: 'academia', grupoFamiliar: '', clases: [] },
            { nombre: 'Lucía y Amaia', apoderado: 'Carolina', instrumento: 'Piano y Flauta', profesor: 'Carolina', aporte: 180000, modalidad: 'duo', grupoFamiliar: 'Familia Lucía y Amaia', clases: [] },
            { nombre: 'Santiago y Sofía', apoderado: 'Carolina', instrumento: 'Guitarra y Piano', profesor: 'Carolina', aporte: 270000, modalidad: 'duo', grupoFamiliar: 'Familia Santiago y Sofía', clases: [] },
            { nombre: 'Angelo', apoderado: 'Mailen', instrumento: 'Guitarra', profesor: 'Mailen', aporte: 100000, modalidad: 'academia', grupoFamiliar: '', clases: [] },
            { nombre: 'Miranda', apoderado: 'Mailen', instrumento: 'Piano', profesor: 'Mailen', aporte: 100000, modalidad: 'academia', grupoFamiliar: '', clases: [] },
            { nombre: 'Rafaela 1', apoderado: 'Mailen', instrumento: 'Flauta', profesor: 'Mailen', aporte: 100000, modalidad: 'academia', grupoFamiliar: '', clases: [] },
            { nombre: 'Luciano', apoderado: 'Mailen', instrumento: 'Batería', profesor: 'Mailen', aporte: 100000, modalidad: 'academia', grupoFamiliar: '', clases: [] },
            { nombre: 'Estefanía', apoderado: 'Mailen', instrumento: 'Canto', profesor: 'Mailen', aporte: 100000, modalidad: 'academia', grupoFamiliar: '', clases: [] },
            { nombre: 'Dominga', apoderado: 'Mailen', instrumento: 'Piano', profesor: 'Mailen', aporte: 140000, modalidad: 'domicilio', grupoFamiliar: '', clases: [] },
            { nombre: 'Oliver', apoderado: 'Mailen', instrumento: 'Guitarra', profesor: 'Mailen', aporte: 140000, modalidad: 'domicilio', grupoFamiliar: '', clases: [] },
            { nombre: 'Félix', apoderado: 'Mailen', instrumento: 'Flauta', profesor: 'Mailen', aporte: 140000, modalidad: 'domicilio', grupoFamiliar: '', clases: [] },
            { nombre: 'Rafaela 2', apoderado: 'Mailen', instrumento: 'Violín', profesor: 'Mailen', aporte: 140000, modalidad: 'domicilio', grupoFamiliar: '', clases: [] }
        ];

        const profesoresIniciales = [
            { id: 1, nombre: 'Carolina', especialidad: 'Flauta, Piano, Guitarra', valorHora: 15000 },
            { id: 2, nombre: 'Mailen', especialidad: 'Piano, Guitarra, Canto', valorHora: 15000 }
        ];

        const inventarioInicial = [
            { id: 1, nombre: 'Flauta traversa Yamaha', categoria: 'Instrumentos', cantidad: 3, estado: 'bueno', ubicacion: 'Sala 1' },
            { id: 2, nombre: 'Piano vertical', categoria: 'Instrumentos', cantidad: 1, estado: 'regular', ubicacion: 'Sala Principal' },
            { id: 3, nombre: 'Guitarra acústica', categoria: 'Instrumentos', cantidad: 2, estado: 'bueno', ubicacion: 'Sala 2' },
            { id: 4, nombre: 'Batería completa', categoria: 'Instrumentos', cantidad: 1, estado: 'regular', ubicacion: 'Sala 3' },
            { id: 5, nombre: 'Partituras método Suzuki', categoria: 'Material Didáctico', cantidad: 5, estado: 'bueno', ubicacion: 'Biblioteca' },
            { id: 6, nombre: 'Sillas plegables', categoria: 'Mobiliario', cantidad: 10, estado: 'bueno', ubicacion: 'Bodega' },
            { id: 7, nombre: 'Atriles', categoria: 'Mobiliario', cantidad: 6, estado: 'regular', ubicacion: 'Sala 1' }
        ];

        const comprasIniciales = [
            { id: 1, nombre: 'Cuerdas para guitarra (juego)', prioridad: 'alta', nota: 'Se necesitan 5 juegos' },
            { id: 2, nombre: 'Metrónomo digital', prioridad: 'media', nota: 'Para sala de ensayo' },
            { id: 3, nombre: 'Estantería para partituras', prioridad: 'baja', nota: 'Para organizar biblioteca' }
        ];

        // ===== COMPUTED =====
        const alumnosOrdenados = computed(() => {
            return [...alumnos.value].sort((a, b) => (Number(b.aporte) || 0) - (Number(a.aporte) || 0));
        });

        const totalIngresos = computed(() => {
            return alumnos.value.reduce((sum, a) => sum + (Number(a.aporte) || 0), 0);
        });

        const calcularHonorariosProfesores = () => {
            const honorarios = [];
            const ahora = new Date();
            const mesActual = ahora.getMonth();
            const añoActual = ahora.getFullYear();
            profesores.value.forEach(prof => {
                let totalClases = 0;
                alumnos.value.forEach(alumno => {
                    if (alumno.profesor === prof.nombre && alumno.clases) {
                        alumno.clases.forEach(clase => {
                            const fechaClase = new Date(clase.fecha);
                            if (fechaClase.getMonth() === mesActual && fechaClase.getFullYear() === añoActual) {
                                totalClases++;
                            }
                        });
                    }
                });
                if (totalClases > 0) {
                    const horas = totalClases * 0.75;
                    const total = horas * (Number(prof.valorHora) || 0);
                    honorarios.push({
                        profesor: prof.nombre,
                        clases: totalClases,
                        horas: horas,
                        valorHora: Number(prof.valorHora) || 0,
                        total: total
                    });
                }
            });
            return honorarios;
        };

        const gastosAutomaticos = computed(() => {
            const honorarios = calcularHonorariosProfesores();
            const resultado = [];
            honorarios.forEach(h => {
                resultado.push({
                    id: 'auto_' + h.profesor + '_' + Date.now(),
                    concepto: `Honorarios ${h.profesor}`,
                    categoria: 'sueldos',
                    monto: h.total,
                    fecha: new Date().toISOString().slice(0, 10),
                    comprobante: '',
                    automatico: true,
                    profesor: h.profesor
                });
            });
            return resultado;
        });

        const gastosTotales = computed(() => {
            const manuales = gastos.value || [];
            const automaticos = gastosAutomaticos.value || [];
            return [...manuales, ...automaticos];
        });

        const totalGastos = computed(() => {
            return gastosTotales.value.reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
        });

        const saldo = computed(() => totalIngresos.value - totalGastos.value);

        const ingresoPromedio = computed(() => {
            if (alumnos.value.length === 0) return 0;
            return totalIngresos.value / alumnos.value.length;
        });

        const totalAlumnosHistoricos = computed(() => {
            return alumnos.value.length;
        });

        const gastosPorCategoria = computed(() => {
            const categoriasMap = {
                'sueldos': { icon: '💰', nombre: 'Sueldos' },
                'contabilidad': { icon: '📊', nombre: 'Contabilidad' },
                'material': { icon: '📚', nombre: 'Material' },
                'instrumentos': { icon: '🎸', nombre: 'Instrumentos' },
                'servicios': { icon: '💡', nombre: 'Servicios' },
                'insumos': { icon: '☕', nombre: 'Insumos' },
                'marketing': { icon: '📱', nombre: 'Marketing' },
                'arriendo': { icon: '🏠', nombre: 'Arriendo' },
                'otros': { icon: '📦', nombre: 'Otros' }
            };
            const cats = {};
            gastosTotales.value.forEach(g => {
                const cat = g.categoria || 'otros';
                if (!cats[cat]) cats[cat] = [];
                cats[cat].push(g);
            });
            const resultado = [];
            Object.keys(cats).forEach(key => {
                const items = cats[key];
                const total = items.reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
                resultado.push({
                    nombre: categoriasMap[key]?.nombre || key,
                    icon: categoriasMap[key]?.icon || '📦',
                    total: total,
                    items: items
                });
            });
            return resultado.sort((a, b) => b.total - a.total);
        });

        const clasesAgrupadas = computed(() => {
            if (alumnoSeleccionado.value === null) return {};
            const alumno = alumnos.value[alumnoSeleccionado.value];
            if (!alumno || !alumno.clases) return {};
            const grupos = {};
            alumno.clases.forEach(clase => {
                const fecha = new Date(clase.fecha);
                const key = fecha.toLocaleDateString('es-CL', { year: 'numeric', month: 'long' });
                if (!grupos[key]) grupos[key] = { clases: [] };
                grupos[key].clases.push(clase);
            });
            return grupos;
        });

        const gruposFamiliares = computed(() => {
            const grupos = {};
            alumnos.value.forEach(a => {
                if (a.grupoFamiliar) {
                    if (!grupos[a.grupoFamiliar]) grupos[a.grupoFamiliar] = [];
                    grupos[a.grupoFamiliar].push(a);
                }
            });
            const result = [];
            Object.keys(grupos).forEach(key => {
                const miembros = grupos[key];
                const total = miembros.reduce((sum, m) => sum + (Number(m.aporte) || 0), 0);
                result.push({
                    nombre: key,
                    miembros: miembros.map(m => m.nombre),
                    total: total,
                    ids: miembros.map(m => m.id)
                });
            });
            return result;
        });

        const dataCrecimiento = computed(() => {
            const historico = localStorage.getItem('casa_spa_historico_ingresos');
            let datos = [];
            if (historico) {
                try { datos = JSON.parse(historico); } catch (e) { datos = []; }
            }
            if (datos.length === 0) {
                const mesActual = new Date();
                for (let i = 5; i >= 0; i--) {
                    const mes = new Date(mesActual);
                    mes.setMonth(mes.getMonth() - i);
                    const valor = Math.round(totalIngresos.value * (0.7 + (i / 5) * 0.3) * (0.85 + Math.random() * 0.3));
                    datos.push({ mes: mes.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' }), valor: valor });
                }
            }
            return datos;
        });

        const maxIngreso = computed(() => {
            if (dataCrecimiento.value.length === 0) return 1;
            const max = Math.max(...dataCrecimiento.value.map(d => d.valor || 0), 1);
            return max;
        });

        // ===== TOAST =====
        const showToast = (msg) => {
            toastMessage.value = msg;
            toastVisible.value = true;
            setTimeout(() => { toastVisible.value = false; }, 2000);
        };

        // ===== DARK MODE =====
        const toggleDarkMode = () => {
            isDarkMode.value = !isDarkMode.value;
            document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light');
            localStorage.setItem('casa_musical_darkmode', isDarkMode.value ? 'dark' : 'light');
        };

        const loadDarkMode = () => {
            const saved = localStorage.getItem('casa_musical_darkmode');
            if (saved === 'dark') {
                isDarkMode.value = true;
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        };

        // ===== CRUD ALUMNOS =====
        const agregarAlumno = () => {
            if (!nuevoAlumno.value.nombre) { showToast('⚠️ Ingresa el nombre'); return; }
            let aporte = Number(nuevoAlumno.value.aporte);
            if (nuevoAlumno.value.aporte === 0) {
                aporte = Number(nuevoAlumno.value.aporteCustom) || 0;
            }
            if (aporte <= 0) { showToast('⚠️ Ingresa un monto válido'); return; }
            alumnos.value.push({
                id: Date.now(),
                nombre: nuevoAlumno.value.nombre,
                apoderado: nuevoAlumno.value.apoderado || '',
                instrumento: nuevoAlumno.value.instrumento || '',
                profesor: nuevoAlumno.value.profesor || '',
                aporte: aporte,
                modalidad: nuevoAlumno.value.modalidad || 'academia',
                grupoFamiliar: '',
                clases: []
            });
            nuevoAlumno.value = { nombre: '', apoderado: '', instrumento: '', profesor: '', aporte: '100000', aporteCustom: '', modalidad: 'academia', grupoFamiliar: '', clases: [] };
            guardarDatos();
            guardarHistorico();
            showToast('✅ Alumno agregado');
        };

        const eliminarAlumno = (index) => {
            if (confirm('¿Eliminar este alumno?')) {
                alumnos.value.splice(index, 1);
                if (alumnoSeleccionado.value === index) alumnoSeleccionado.value = null;
                guardarDatos();
                showToast('🗑️ Alumno eliminado');
            }
        };

        const editarAlumno = (index) => {
            const a = alumnos.value[index];
            modalTipo.value = 'alumno';
            modalIndex.value = index;
            modalTitulo.value = `✏️ Editar: ${a.nombre}`;
            modalDatos.value = {
                nombre: a.nombre,
                apoderado: a.apoderado || '',
                instrumento: a.instrumento || '',
                profesor: a.profesor || '',
                aporte: a.aporte || '',
                modalidad: a.modalidad || 'academia',
                grupoFamiliar: a.grupoFamiliar || ''
            };
            modalCampos.value = {
                nombre: { label: 'Nombre', tipo: 'text', placeholder: 'Nombre' },
                apoderado: { label: 'Apoderado', tipo: 'text', placeholder: 'Apoderado' },
                instrumento: { label: 'Instrumento', tipo: 'text', placeholder: 'Instrumento' },
                profesor: { label: 'Profesor', tipo: 'text', placeholder: 'Profesor' },
                aporte: { label: 'Aporte Mensual (CLP)', tipo: 'number', placeholder: '100000' },
                modalidad: { label: 'Modalidad', tipo: 'select', opciones: ['academia', 'domicilio', 'duo'] },
                grupoFamiliar: { label: 'Grupo Familiar', tipo: 'text', placeholder: 'Ej: Familia González' }
            };
            modalVisible.value = true;
        };

        const verClasesAlumno = (index) => {
            alumnoSeleccionado.value = index;
            mesesAbiertos.value = {};
        };

        const toggleMes = (key) => {
            mesesAbiertos.value[key] = !mesesAbiertos.value[key];
        };

        const agregarClase = () => {
            if (alumnoSeleccionado.value === null) return;
            if (!nuevaClase.value.fecha) { showToast('⚠️ Fecha requerida'); return; }
            const alumno = alumnos.value[alumnoSeleccionado.value];
            alumno.clases.push({
                fecha: nuevaClase.value.fecha,
                contenido: nuevaClase.value.contenido || 'Clase'
            });
            nuevaClase.value = { fecha: new Date().toISOString().slice(0, 10), contenido: '' };
            guardarDatos();
            showToast('✅ Clase registrada');
        };

        const eliminarClase = (idx) => {
            if (alumnoSeleccionado.value === null) return;
            const alumno = alumnos.value[alumnoSeleccionado.value];
            if (confirm('¿Eliminar esta clase?')) {
                alumno.clases.splice(idx, 1);
                guardarDatos();
                showToast('🗑️ Clase eliminada');
            }
        };

        // ===== GRUPOS FAMILIARES =====
        const abrirModalGrupoFamiliar = () => {
            modalGrupoVisible.value = true;
            modalGrupoTitulo.value = '👨‍👩‍👧‍👦 Crear Grupo';
            modalGrupoIndex.value = null;
            modalGrupoDatos.value = { nombre: '', miembros: [], descuento: 0 };
        };

        const guardarGrupoFamiliar = () => {
            if (!modalGrupoDatos.value.nombre) { showToast('⚠️ Ingresa un nombre para el grupo'); return; }
            if (!modalGrupoDatos.value.miembros || modalGrupoDatos.value.miembros.length === 0) {
                showToast('⚠️ Selecciona al menos un alumno');
                return;
            }
            const nombre = modalGrupoDatos.value.nombre;
            const ids = modalGrupoDatos.value.miembros;
            alumnos.value.forEach(a => {
                if (ids.includes(a.id)) {
                    a.grupoFamiliar = nombre;
                } else if (a.grupoFamiliar === nombre) {
                    a.grupoFamiliar = '';
                }
            });
            const descuento = Number(modalGrupoDatos.value.descuento) || 0;
            if (descuento > 0) {
                gastos.value.push({
                    id: Date.now(),
                    concepto: `Descuento grupo "${nombre}"`,
                    categoria: 'otros',
                    monto: descuento,
                    fecha: new Date().toISOString().slice(0, 10),
                    comprobante: '',
                    automatico: false
                });
            }
            cerrarModalGrupo();
            guardarDatos();
            showToast('✅ Grupo guardado');
        };

        const cerrarModalGrupo = () => {
            modalGrupoVisible.value = false;
            modalGrupoDatos.value = { nombre: '', miembros: [], descuento: 0 };
            modalGrupoIndex.value = null;
        };

        // ===== CRUD PROFESORES =====
        const agregarProfesor = () => {
            if (!nuevoProfesor.value.nombre) { showToast('⚠️ Ingresa el nombre'); return; }
            profesores.value.push({
                id: Date.now(),
                ...nuevoProfesor.value,
                valorHora: Number(nuevoProfesor.value.valorHora) || 0
            });
            nuevoProfesor.value = { nombre: '', especialidad: '', valorHora: '' };
            guardarDatos();
            showToast('✅ Profesor agregado');
        };

        const eliminarProfesor = (index) => {
            if (confirm('¿Eliminar este profesor?')) {
                profesores.value.splice(index, 1);
                guardarDatos();
                showToast('🗑️ Profesor eliminado');
            }
        };

        const editarProfesor = (index) => {
            const p = profesores.value[index];
            modalTipo.value = 'profesor';
            modalIndex.value = index;
            modalTitulo.value = `✏️ Editar: ${p.nombre}`;
            modalDatos.value = {
                nombre: p.nombre,
                especialidad: p.especialidad || '',
                valorHora: p.valorHora || ''
            };
            modalCampos.value = {
                nombre: { label: 'Nombre', tipo: 'text', placeholder: 'Nombre' },
                especialidad: { label: 'Especialidad', tipo: 'text', placeholder: 'Flauta, Piano' },
                valorHora: { label: 'Valor Hora (CLP)', tipo: 'number', placeholder: '15000' }
            };
            modalVisible.value = true;
        };

        // ===== CRUD GASTOS =====
        const agregarGasto = () => {
            if (!nuevoGasto.value.concepto || !nuevoGasto.value.monto) {
                showToast('⚠️ Completa concepto y monto');
                return;
            }
            gastos.value.push({
                id: Date.now(),
                ...nuevoGasto.value,
                monto: Number(nuevoGasto.value.monto) || 0,
                fecha: new Date().toISOString().slice(0, 10),
                comprobante: nuevoGasto.value.comprobante || '',
                automatico: false
            });
            nuevoGasto.value = { concepto: '', categoria: 'servicios', monto: '', fecha: new Date().toISOString().slice(0, 10), comprobante: '' };
            guardarDatos();
            showToast('✅ Gasto registrado');
        };

        const eliminarGasto = (index) => {
            const gasto = gastosTotales.value[index];
            if (!gasto) return;
            if (gasto.automatico) {
                showToast('⚠️ Los gastos automáticos no se pueden eliminar');
                return;
            }
            if (confirm('¿Eliminar este gasto?')) {
                const idxManual = gastos.value.findIndex(g => g.id === gasto.id);
                if (idxManual >= 0) {
                    gastos.value.splice(idxManual, 1);
                    guardarDatos();
                    showToast('🗑️ Gasto eliminado');
                }
            }
        };

        const toggleCategoria = (nombre) => {
            categoriasAbiertas.value[nombre] = !categoriasAbiertas.value[nombre];
        };

        // ===== CRUD INVENTARIO =====
        const agregarInventario = () => {
            if (!nuevoInventario.value.nombre) { showToast('⚠️ Ingresa el nombre del item'); return; }
            inventario.value.push({
                id: Date.now(),
                ...nuevoInventario.value,
                cantidad: Number(nuevoInventario.value.cantidad) || 1
            });
            nuevoInventario.value = { nombre: '', categoria: '', cantidad: 1, estado: 'bueno', ubicacion: '' };
            guardarDatos();
            showToast('✅ Item agregado al inventario');
        };

        const eliminarInventario = (index) => {
            if (confirm('¿Eliminar este item del inventario?')) {
                inventario.value.splice(index, 1);
                guardarDatos();
                showToast('🗑️ Item eliminado');
            }
        };

        const editarInventario = (index) => {
            const item = inventario.value[index];
            modalTipo.value = 'inventario';
            modalIndex.value = index;
            modalTitulo.value = `✏️ Editar: ${item.nombre}`;
            modalDatos.value = {
                nombre: item.nombre,
                categoria: item.categoria || '',
                cantidad: item.cantidad || 1,
                estado: item.estado || 'bueno',
                ubicacion: item.ubicacion || ''
            };
            modalCampos.value = {
                nombre: { label: 'Nombre', tipo: 'text', placeholder: 'Nombre del item' },
                categoria: { label: 'Categoría', tipo: 'text', placeholder: 'Ej: Instrumentos' },
                cantidad: { label: 'Cantidad', tipo: 'number', placeholder: '1' },
                estado: { label: 'Estado', tipo: 'select', opciones: ['bueno', 'regular', 'malo'] },
                ubicacion: { label: 'Ubicación', tipo: 'text', placeholder: 'Ej: Sala 1' }
            };
            modalVisible.value = true;
        };

        // ===== CRUD COMPRAS =====
        const agregarCompra = () => {
            if (!nuevaCompra.value.nombre) { showToast('⚠️ Ingresa qué necesitas comprar'); return; }
            comprasPendientes.value.push({
                id: Date.now(),
                ...nuevaCompra.value
            });
            nuevaCompra.value = { nombre: '', prioridad: 'media', nota: '' };
            guardarDatos();
            showToast('✅ Compra agregada a la lista');
        };

        const eliminarCompra = (index) => {
            if (confirm('¿Eliminar esta compra de la lista?')) {
                comprasPendientes.value.splice(index, 1);
                guardarDatos();
                showToast('🗑️ Compra eliminada');
            }
        };

        // ===== GUARDAR EDICIÓN =====
        const guardarEdicion = () => {
            if (modalTipo.value === 'alumno') {
                const a = alumnos.value[modalIndex.value];
                Object.assign(a, { ...modalDatos.value, aporte: Number(modalDatos.value.aporte) || 0 });
                showToast('✅ Alumno actualizado');
            } else if (modalTipo.value === 'profesor') {
                const p = profesores.value[modalIndex.value];
                Object.assign(p, { ...modalDatos.value, valorHora: Number(modalDatos.value.valorHora) || 0 });
                showToast('✅ Profesor actualizado');
            } else if (modalTipo.value === 'inventario') {
                const item = inventario.value[modalIndex.value];
                Object.assign(item, { ...modalDatos.value, cantidad: Number(modalDatos.value.cantidad) || 1 });
                showToast('✅ Item actualizado');
            }
            cerrarModal();
            guardarDatos();
        };

        const cerrarModal = () => {
            modalVisible.value = false;
            modalDatos.value = {};
            modalCampos.value = {};
        };

        // ===== DOCUMENTOS =====
        const generarDocumentoAlumno = () => {
            if (!documentoAlumnoId.value) return;
            const alumno = alumnos.value.find(a => a.id === documentoAlumnoId.value);
            if (!alumno) return;
            const mes = new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long' });
            const modalidadTexto = alumno.modalidad === 'domicilio' ? 'A Domicilio' :
                alumno.modalidad === 'duo' ? 'Plan Dúo' : 'En Academia';
            let doc = `=== CASA MUSICAL ACADEMIA SPA ===\n`;
            doc += `DOCUMENTO DE SERVICIOS EDUCACIONALES\n\n`;
            doc += `Fecha: ${new Date().toLocaleDateString('es-CL')}\n`;
            doc += `Período: ${mes}\n`;
            doc += `--------------------------------------------------\n`;
            doc += `Apoderado: ${alumno.apoderado || 'No especificado'}\n`;
            doc += `Alumno(s): ${alumno.nombre}\n`;
            doc += `Instrumento(s): ${alumno.instrumento || 'No especificado'}\n`;
            doc += `Profesor: ${alumno.profesor || 'No asignado'}\n`;
            doc += `Modalidad: ${modalidadTexto}\n`;
            if (alumno.grupoFamiliar) {
                doc += `Grupo Familiar: ${alumno.grupoFamiliar}\n`;
            }
            doc += `--------------------------------------------------\n`;
            doc += `DETALLE DE CLASES DEL MES:\n`;
            if (alumno.clases && alumno.clases.length > 0) {
                alumno.clases.forEach((c, i) => {
                    doc += `${i+1}. ${c.fecha} · ${c.contenido || 'Clase'}\n`;
                });
            } else {
                doc += `No hay clases registradas este mes.\n`;
            }
            doc += `--------------------------------------------------\n`;
            doc += `RESUMEN DE PAGOS:\n`;
            doc += `**Aporte Mensual: $${Number(alumno.aporte).toLocaleString()}**\n`;
            doc += `* Servicio exento de IVA (Educación formal)\n`;
            doc += `**Total a Pagar: $${Number(alumno.aporte).toLocaleString()}**\n`;
            doc += `--------------------------------------------------\n`;
            doc += `* Casa Musical Academia SPA · Música con alma\n`;
            doc += `* Disciplina desde el amor, no desde la dureza\n`;
            ultimoDocumento.value = doc;
            currentTab.value = 'documentos';
            showToast('📄 Documento generado');
        };

        const descargarPDF = () => {
            if (!ultimoDocumento.value) { showToast('⚠️ No hay documento'); return; }
            const el = document.createElement('div');
            el.style.padding = '14px';
            el.style.fontFamily = 'Courier New, monospace';
            el.style.fontSize = '8px';
            el.style.whiteSpace = 'pre-wrap';
            el.style.backgroundColor = '#fff';
            el.style.color = '#1a2b3c';
            el.style.maxWidth = '700px';
            el.style.margin = '0 auto';
            el.style.lineHeight = '1.3';
            el.textContent = ultimoDocumento.value;
            document.body.appendChild(el);
            html2pdf().set({
                margin: 0.3,
                filename: `documento_${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            }).from(el).save().then(() => { document.body.removeChild(el); });
            showToast('⬇️ Descargando PDF...');
        };

        const copiarDocumento = async () => {
            if (!ultimoDocumento.value) return;
            try {
                await navigator.clipboard.writeText(ultimoDocumento.value);
                showToast('📋 Copiado');
            } catch {
                const ta = document.createElement('textarea');
                ta.value = ultimoDocumento.value;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                showToast('📋 Copiado');
            }
        };

        const generarInformeContador = () => {
            const mes = new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long' });
            let doc = `=============================================================\n`;
            doc += `             INFORME PARA CONTADOR AUDITOR\n`;
            doc += `                 CASA MUSICAL ACADEMIA SPA\n`;
            doc += `=============================================================\n\n`;
            doc += `📋 DATOS DE LA ACADEMIA\n`;
            doc += `-------------------------------------------------------------\n`;
            doc += `RUT: 76.123.456-7\n`;
            doc += `Razón Social: Casa Musical Academia SPA\n`;
            doc += `Giro: Enseñanza de música\n`;
            doc += `Dirección: [Ingresar dirección]\n`;
            doc += `Teléfono: [Ingresar teléfono]\n`;
            doc += `Email: contacto@casamusical.cl\n`;
            doc += `-------------------------------------------------------------\n`;
            doc += `📅 PERIODO: ${mes}\n`;
            doc += `=============================================================\n\n`;
            doc += `💰 RESUMEN DE INGRESOS\n`;
            doc += `-------------------------------------------------------------\n`;
            doc += `Total Alumnos: ${alumnos.value.length}\n`;
            doc += `Ingresos Totales: $${totalIngresos.value.toLocaleString()}\n`;
            doc += `-------------------------------------------------------------\n\n`;
            doc += `👨‍🎓 DETALLE POR ALUMNO\n`;
            doc += `-------------------------------------------------------------\n`;
            if (alumnos.value.length > 0) {
                alumnos.value.forEach((a, i) => {
                    const modalidad = a.modalidad === 'duo' ? 'Dúo' : a.modalidad;
                    doc += `${i+1}. ${a.nombre} | ${a.instrumento || 'Sin instrumento'} | ${modalidad} | $${Number(a.aporte).toLocaleString()}\n`;
                });
            } else {
                doc += `No hay alumnos registrados.\n`;
            }
            doc += `-------------------------------------------------------------\n\n`;
            doc += `📤 RESUMEN DE GASTOS\n`;
            doc += `-------------------------------------------------------------\n`;
            doc += `Total Gastos: $${totalGastos.value.toLocaleString()}\n`;
            doc += `-------------------------------------------------------------\n\n`;
            doc += `🧾 RESUMEN TRIBUTARIO\n`;
            doc += `-------------------------------------------------------------\n`;
            doc += `Total Ingresos: $${totalIngresos.value.toLocaleString()}\n`;
            doc += `Total Gastos: $${totalGastos.value.toLocaleString()}\n`;
            doc += `Saldo: $${saldo.value.toLocaleString()}\n`;
            doc += `-------------------------------------------------------------\n`;
            doc += `⚠️ NOTAS TRIBUTARIAS:\n`;
            doc += `- Servicios educacionales exentos de IVA (Art. 12, N° 17, L-IVA)\n`;
            doc += `- Se recomienda emitir boletas de honorarios a los profesores\n`;
            doc += `- Declaración mensual F29 ante el SII\n`;
            doc += `- Revisar obligaciones con SII y Tesorería General de la República\n`;
            doc += `=============================================================\n`;
            doc += `Informe generado: ${new Date().toLocaleString('es-CL')}\n`;
            doc += `Casa Musical Academia SPA - Academia de Música\n`;
            informeContador.value = doc;
            showToast('🧾 Informe generado');
        };

        const descargarPDFContador = () => {
            if (!informeContador.value) { showToast('⚠️ Genera el informe primero'); return; }
            const el = document.createElement('div');
            el.style.padding = '14px';
            el.style.fontFamily = 'Courier New, monospace';
            el.style.fontSize = '8px';
            el.style.whiteSpace = 'pre-wrap';
            el.style.backgroundColor = '#fff';
            el.style.color = '#1a2b3c';
            el.style.maxWidth = '700px';
            el.style.margin = '0 auto';
            el.style.lineHeight = '1.3';
            el.textContent = informeContador.value;
            document.body.appendChild(el);
            html2pdf().set({
                margin: 0.3,
                filename: `informe_contador_${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            }).from(el).save().then(() => { document.body.removeChild(el); });
            showToast('⬇️ Descargando informe...');
        };

        // ===== RESPALDO =====
        const exportarRespaldo = () => {
            const datos = {
                alumnos: alumnos.value,
                profesores: profesores.value,
                gastos: gastos.value,
                inventario: inventario.value,
                compras: comprasPendientes.value,
                fecha: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `respaldo_casa_spa_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('💾 Respaldo exportado');
        };

        // ===== PERSISTENCIA =====
        const guardarDatos = () => {
            try {
                localStorage.setItem('casa_spa_alumnos', JSON.stringify(alumnos.value));
                localStorage.setItem('casa_spa_profesores', JSON.stringify(profesores.value));
                localStorage.setItem('casa_spa_gastos', JSON.stringify(gastos.value));
                localStorage.setItem('casa_spa_inventario', JSON.stringify(inventario.value));
                localStorage.setItem('casa_spa_compras', JSON.stringify(comprasPendientes.value));
                sessionStorage.setItem('casa_spa_alumnos_backup', JSON.stringify(alumnos.value));
                sessionStorage.setItem('casa_spa_profesores_backup', JSON.stringify(profesores.value));
                sessionStorage.setItem('casa_spa_gastos_backup', JSON.stringify(gastos.value));
            } catch (e) { console.error('Error guardando:', e); }
        };

        const guardarHistorico = () => {
            try {
                const mes = new Date().toISOString().slice(0, 7);
                const historico = localStorage.getItem('casa_spa_historico_ingresos');
                let datos = [];
                if (historico) {
                    try { datos = JSON.parse(historico); } catch (e) { datos = []; }
                }
                const existe = datos.findIndex(d => d.mes === mes);
                if (existe >= 0) {
                    datos[existe].valor = totalIngresos.value;
                } else {
                    datos.push({ mes: mes, valor: totalIngresos.value });
                }
                if (datos.length > 12) {
                    datos = datos.slice(-12);
                }
                localStorage.setItem('casa_spa_historico_ingresos', JSON.stringify(datos));
            } catch (e) { console.error('Error guardando histórico:', e); }
        };

        const cargarDatos = () => {
            try {
                let a = localStorage.getItem('casa_spa_alumnos');
                let p = localStorage.getItem('casa_spa_profesores');
                let g = localStorage.getItem('casa_spa_gastos');
                let i = localStorage.getItem('casa_spa_inventario');
                let c = localStorage.getItem('casa_spa_compras');
                if (a) {
                    alumnos.value = JSON.parse(a);
                } else {
                    alumnos.value = datosIniciales.map((d, i) => ({ ...d, id: Date.now() + i + 1, clases: [] }));
                    guardarDatos();
                }
                if (p) {
                    profesores.value = JSON.parse(p);
                } else {
                    profesores.value = profesoresIniciales;
                    guardarDatos();
                }
                if (g) {
                    gastos.value = JSON.parse(g);
                }
                if (i) {
                    inventario.value = JSON.parse(i);
                } else {
                    inventario.value = inventarioInicial;
                    guardarDatos();
                }
                if (c) {
                    comprasPendientes.value = JSON.parse(c);
                } else {
                    comprasPendientes.value = comprasIniciales;
                    guardarDatos();
                }
            } catch (e) { console.error('Error cargando:', e); }
        };

        watch([alumnos, profesores, gastos, inventario, comprasPendientes], () => {
            guardarDatos();
            guardarHistorico();
        }, { deep: true });

        onMounted(() => {
            loadDarkMode();
            cargarDatos();
            showToast('📂 Datos cargados');
        });

        return {
            currentTab,
            tabs,
            isDarkMode,
            toastVisible,
            toastMessage,
            alumnos,
            nuevoAlumno,
            alumnoSeleccionado,
            nuevaClase,
            mesesAbiertos,
            alumnosOrdenados,
            clasesAgrupadas,
            gruposFamiliares,
            profesores,
            nuevoProfesor,
            gastos,
            nuevoGasto,
            gastosPorCategoria,
            categoriasAbiertas,
            inventario,
            nuevoInventario,
            comprasPendientes,
            nuevaCompra,
            ultimoDocumento,
            documentoAlumnoId,
            informeContador,
            modalVisible,
            modalTitulo,
            modalDatos,
            modalCampos,
            modalGrupoVisible,
            modalGrupoTitulo,
            modalGrupoDatos,
            totalIngresos,
            totalGastos,
            saldo,
            ingresoPromedio,
            totalAlumnosHistoricos,
            dataCrecimiento,
            maxIngreso,
            toggleDarkMode,
            toggleCategoria,
            agregarAlumno,
            eliminarAlumno,
            editarAlumno,
            verClasesAlumno,
            toggleMes,
            agregarClase,
            eliminarClase,
            abrirModalGrupoFamiliar,
            guardarGrupoFamiliar,
            cerrarModalGrupo,
            agregarProfesor,
            eliminarProfesor,
            editarProfesor,
            agregarGasto,
            eliminarGasto,
            agregarInventario,
            eliminarInventario,
            editarInventario,
            agregarCompra,
            eliminarCompra,
            guardarEdicion,
            cerrarModal,
            generarDocumentoAlumno,
            descargarPDF,
            copiarDocumento,
            generarInformeContador,
            descargarPDFContador,
            exportarRespaldo,
            showToast
        };
    }
});

app.mount('#app');