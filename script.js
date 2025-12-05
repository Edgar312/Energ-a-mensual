// ===============================
// Firebase imports (modo module)
// ===============================
/*import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===============================
// Firebase Config)
// ===============================
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: ""
};*/

//const app = initializeApp(firebaseConfig);
//const auth = getAuth(app);
//const db = getFirestore(app);

// =========================
// Elementos base
// =========================
const form = document.getElementById("form-aparato");
const tablaBody = document.querySelector("#tabla-registros tbody");
const resumenTexto = document.getElementById("resumen-consumo");
const resumenDiaMes = document.getElementById("resumen-dia-mes");
const borrarBtn = document.getElementById("borrar-todo");
const tipTexto = document.getElementById("tip-texto");
const selectPais = document.getElementById("pais");
const formMeta = document.getElementById("form-meta");
const inputMeta = document.getElementById("input-meta");
const estadoMeta = document.getElementById("estado-meta");
const selectPlan = document.getElementById("plan");
const planButtons = document.querySelectorAll(".plan-cta");

const zonaSelect = document.getElementById("zona");
const zonaPersonalizadaGrupo = document.getElementById("zona-personalizada-grupo");
const zonaPersonalizadaInput = document.getElementById("zona-personalizada");

// Panel plan
const planNombreEl = document.getElementById("plan-nombre");
const planZonasMaxEl = document.getElementById("plan-zonas-max");
const planRegistrosMaxEl = document.getElementById("plan-registros-max");
const planZonasUsoEl = document.getElementById("plan-zonas-uso");
const planRegistrosUsoEl = document.getElementById("plan-registros-uso");

// Historial
const btnGuardarMes = document.getElementById("guardar-mes");
const selectorHistorial = document.getElementById("selector-historial");
const tablaHistorial = document.getElementById("tabla-historial");
const tbodyHistorial = tablaHistorial.querySelector("tbody");
const tablaZonasBody = document.querySelector("#tabla-zonas tbody");
const btnBorrarHistorial = document.getElementById("borrar-historial");
const btnReportePDF = document.getElementById("btn-reporte-pdf");
const inputInstitucion = document.getElementById("nombre-institucion");

// Botones extra
const btnArriba = document.getElementById("btn-arriba");
const exportarBtn = document.getElementById("exportar-csv");
const btnLogout = document.getElementById("btn-logout");

// === AUTH ELEMENTS ===
/*const authContainer = document.getElementById("auth-container");
const emailInput = document.getElementById("auth-email");
const passInput = document.getElementById("auth-password");
const btnLogin = document.getElementById("btn-login");
const btnRegister = document.getElementById("btn-register");
const toggleAuth = document.getElementById("toggle-auth-mode");

let modoRegistro = false;

// =========================
// Auth UI (login / registro)
// =========================
toggleAuth.addEventListener("click", () => {
  modoRegistro = !modoRegistro;

  if (modoRegistro) {
    btnLogin.style.display = "none";
    btnRegister.style.display = "block";
    toggleAuth.textContent = "¿Ya tienes cuenta? Iniciar sesión";
  } else {
    btnLogin.style.display = "block";
    btnRegister.style.display = "none";
    toggleAuth.textContent = "¿No tienes cuenta? Registrarse";
  }
});

btnRegister.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const pass = passInput.value.trim();

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      email: email,
      plan: "gratis",
      creado: Date.now()
    });

    alert("Cuenta creada con éxito");
  } catch (err) {
    alert("Error: " + err.message);
  }
});

btnLogin.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const pass = passInput.value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (err) {
    alert("Error: " + err.message);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    authContainer.classList.add("hidden");

    const snap = await getDoc(doc(db, "usuarios", user.uid));
    let datos = snap.data();

    console.log("Usuario:", datos);
    // TODO: aquí luego cargaremos sus zonas, registros, historial, plan, etc.

  } else {
    authContainer.classList.remove("hidden");
  }
});

btnLogout.addEventListener("click", () => {
  signOut(auth);
});
*/

// =========================
// Configuración de meta y tarifas
// =========================
let META_KWH = parseFloat(localStorage.getItem("meta_kwh")) || null;
if (META_KWH) {
  inputMeta.value = META_KWH;
}

const tarifasPorPais = {
  mx: 1.7,
  ar: 5.2,
  cl: 2.8,
  co: 0.6,
  pe: 0.8
};

let TARIFA_KWH = tarifasPorPais[selectPais.value];

// =========================
// Planes
// =========================

const planes = {
  personal: {
    nombre: "Personal (Gratis)",
    maxZonas: 3,
    maxAparatosPorZona: 3,
    maxRegistros: 10,
    pdf: false,
    historial: false
  },
  pro: {
    nombre: "Pro (Instituciones pequeñas)",
    maxZonas: 10,
    maxAparatosPorZona: 20,
    maxRegistros: 200,
    pdf: true,
    historial: true
  },
  empresa: {
    nombre: "Empresa",
    maxZonas: 50,
    maxAparatosPorZona: 200,
    maxRegistros: 10000,
    pdf: true,
    historial: true
  }
};


  
let planActual = localStorage.getItem("plan_consumo") || "personal";
selectPlan.value = planActual;

// Nombre institución / empresa
let nombreInstitucion = localStorage.getItem("nombre_institucion") || "";
if (inputInstitucion) {
  inputInstitucion.value = nombreInstitucion;
  inputInstitucion.addEventListener("input", () => {
    nombreInstitucion = inputInstitucion.value.trim();
    localStorage.setItem("nombre_institucion", nombreInstitucion);
  });
}

// =========================
// Registros
// =========================
let registros = JSON.parse(localStorage.getItem("registros_consumo")) || [];

// =========================
// Tips
// =========================
const tips = [
  "Desconecta aparatos que no usas para ahorrar hasta un 15%.",
  "Utiliza focos LED: consumen hasta 80% menos que los incandescentes.",
  "Ajusta tu aire acondicionado a 24°C para mejor eficiencia.",
  "Plancha toda tu ropa en una sola sesión para ahorrar energía.",
  "No abras el refrigerador innecesariamente, evita pérdidas de frío.",
  "Lava con agua fría cuando sea posible para reducir el consumo.",
  "Revisa fugas de aire en puertas y ventanas: mejora eficiencia del A/C.",
  "Apaga y desconecta cargadores cuando no se usan."
];

// =========================
// Chart.js
// =========================
const ctx = document.getElementById("grafica-consumo").getContext("2d");
let graficaConsumo;
let graficaAparato;

// =========================
// Funciones utilitarias
// =========================
function guardarRegistros() {
  localStorage.setItem("registros_consumo", JSON.stringify(registros));
}

function mostrarTip() {
  const random = Math.floor(Math.random() * tips.length);
  tipTexto.textContent = tips[random];
}

// cada 15 s cambia tip
setInterval(mostrarTip, 15000);

function mostrarAlerta() {
  const alerta = document.getElementById("alerta-registro");
  alerta.style.display = "block";
  setTimeout(() => {
    alerta.style.display = "none";
  }, 2000);
}

function getFechaHoyEsMX() {
  return new Date().toLocaleDateString("es-MX");
}

function obtenerZonasUnicas() {
  return Array.from(new Set(registros.map(r => r.zona)));
}

// =========================
// Plan: actualizar panel
// =========================
function actualizarPanelPlan() {
  const config = planes[planActual];
  const zonasUnicas = obtenerZonasUnicas();
  planNombreEl.textContent = config.nombre;
  planZonasMaxEl.textContent = config.maxZonas;
  planRegistrosMaxEl.textContent = config.maxRegistros;
  planZonasUsoEl.textContent = zonasUnicas.length;
  planRegistrosUsoEl.textContent = registros.length;
}
function actualizarFeaturesPorPlan() {
  const config = planes[planActual];

  // PDF
  if (btnReportePDF) {
    if (config.pdf) {
      btnReportePDF.classList.remove("locked");
      btnReportePDF.textContent = "📄 Descargar reporte PDF";
    } else {
      btnReportePDF.classList.add("locked");
      btnReportePDF.textContent = "🔒 PDF solo en Pro o Empresa";
    }
  }

  // Historial mensual
  if (btnGuardarMes) {
    if (config.historial) {
      btnGuardarMes.classList.remove("locked");
      btnGuardarMes.textContent = "📦 Guardar mes actual";
    } else {
      btnGuardarMes.classList.add("locked");
      btnGuardarMes.textContent = "🔒 Historial solo Pro o Empresa";
    }
  }

  if (selectorHistorial) {
    selectorHistorial.disabled = !config.historial;
  }

  if (btnBorrarHistorial) {
    btnBorrarHistorial.disabled = !config.historial;
  }
}


// =========================
// Mostrar registros + resumen + gráficas + meta
// =========================
function mostrarRegistros() {
  tablaBody.innerHTML = "";
  let totalKWh = 0;
  const fechasUnicas = new Set();

  registros.forEach((reg, index) => {
    const tr = document.createElement("tr");
    const consumo = (reg.watts * reg.horas / 1000);
    totalKWh += consumo;
    fechasUnicas.add(reg.fecha);

    tr.innerHTML = `
      <td>${reg.nombre}</td>
      <td>${reg.zona}</td>
      <td>${reg.watts}</td>
      <td>${reg.horas}</td>
      <td>${reg.fecha}</td>
      <td>${consumo.toFixed(2)}</td>
      <td><button class="btn-eliminar" data-index="${index}">🗑️</button></td>
    `;
    tablaBody.appendChild(tr);
  });

  const costoNum = totalKWh * TARIFA_KWH;
  const costo = costoNum.toFixed(2);
  const dias = fechasUnicas.size || 1;
  const costoDiaNum = costoNum / dias;
  const costoDia = costoDiaNum.toFixed(2);
  const costoMes = (costoDiaNum * 30).toFixed(2);

  resumenTexto.textContent = `Total kWh: ${totalKWh.toFixed(2)} | Costo aprox.: $${costo}`;
  resumenDiaMes.textContent = `Costo por día: $${costoDia} | Estimado mensual: $${costoMes}`;

  actualizarGraficaConsumo();
  actualizarGraficaPorAparato();
  mostrarTopAparatos();
  mostrarResumenSemanal();
  actualizarEstadoMeta(totalKWh);
  actualizarPanelPlan();
  actualizarTablaZonas(totalKWh);
  actualizarFeaturesPorPlan();

}

function actualizarEstadoMeta(totalKWh) {
  if (META_KWH !== null) {
    if (totalKWh > META_KWH) {
      estadoMeta.textContent = `⚠️ Has superado tu meta mensual de ${META_KWH} kWh. Total: ${totalKWh.toFixed(2)} kWh`;
      estadoMeta.style.color = "#ef4444";
    } else {
      estadoMeta.textContent = `✅ Vas bien: ${totalKWh.toFixed(2)} / ${META_KWH} kWh`;
      estadoMeta.style.color = "#16a34a";
    }
  } else {
    estadoMeta.textContent = "Aún no has definido una meta.";
    estadoMeta.style.color = "";
  }
}

// =========================
// Gráfica de consumo diario
// =========================
function actualizarGraficaConsumo() {
  const consumoPorDia = {};

  registros.forEach(registro => {
    const fecha = registro.fecha;
    const consumo = (registro.watts * registro.horas) / 1000;
    consumoPorDia[fecha] = (consumoPorDia[fecha] || 0) + consumo;
  });

  const fechas = Object.keys(consumoPorDia);
  const valores = Object.values(consumoPorDia);

  if (fechas.length === 0) {
    if (graficaConsumo) graficaConsumo.destroy();
    return;
  }

  if (graficaConsumo) graficaConsumo.destroy();

  graficaConsumo = new Chart(ctx, {
    type: "bar",
    data: {
      labels: fechas,
      datasets: [{
        label: "Consumo (kWh)",
        data: valores,
        backgroundColor: "rgba(37, 99, 235, 0.8)",
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 700,
        easing: "easeOutQuart"
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// =========================
// Gráfica por aparato
// =========================
function actualizarGraficaPorAparato() {
  const consumoPorAparato = {};

  registros.forEach(reg => {
    const consumo = (reg.watts * reg.horas) / 1000;
    consumoPorAparato[reg.nombre] = (consumoPorAparato[reg.nombre] || 0) + consumo;
  });

  const aparatos = Object.keys(consumoPorAparato);
  const valores = Object.values(consumoPorAparato);

  const ctxAparato = document.getElementById("grafica-aparato").getContext("2d");

  if (graficaAparato) graficaAparato.destroy();
  if (aparatos.length === 0) return;

  graficaAparato = new Chart(ctxAparato, {
    type: "pie",
    data: {
      labels: aparatos,
      datasets: [{
        data: valores,
        backgroundColor: [
          "#2563eb", "#22c55e", "#f97316", "#ef4444",
          "#8b5cf6", "#06b6d4", "#facc15", "#ec4899"
        ],
        borderColor: "#0f172a",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right"
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.parsed.toFixed(2)} kWh`;
            }
          }
        }
      }
    }
  });
}

// =========================
// Consumo por zona
// =========================
function obtenerConsumoPorZona(lista = registros) {
  const consumoPorZona = {};

  lista.forEach(reg => {
    const zona = reg.zona || "Sin zona";
    const consumo = (reg.watts * reg.horas) / 1000;
    consumoPorZona[zona] = (consumoPorZona[zona] || 0) + consumo;
  });

  return consumoPorZona;
}

function actualizarTablaZonas(totalKWh) {
  if (!tablaZonasBody) return;

  tablaZonasBody.innerHTML = "";

  const consumoPorZona = obtenerConsumoPorZona();
  const entradas = Object.entries(consumoPorZona)
    .sort((a, b) => b[1] - a[1]);

  if (entradas.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="3">Sin datos todavía.</td>`;
    tablaZonasBody.appendChild(tr);
    return;
  }

  entradas.forEach(([zona, consumo]) => {
    const porcentaje = totalKWh > 0 ? (consumo / totalKWh) * 100 : 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${zona}</td>
      <td>${consumo.toFixed(2)}</td>
      <td>${porcentaje.toFixed(1)}%</td>
    `;
    tablaZonasBody.appendChild(tr);
  });
}

// =========================
// Top 3 aparatos
// =========================
function mostrarTopAparatos() {
  const consumoTotal = {};

  registros.forEach(reg => {
    const consumo = (reg.watts * reg.horas) / 1000;
    consumoTotal[reg.nombre] = (consumoTotal[reg.nombre] || 0) + consumo;
  });

  const top3 = Object.entries(consumoTotal)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const listaTop = document.getElementById("lista-top");
  listaTop.innerHTML = "";

  if (top3.length === 0) {
    listaTop.innerHTML = "<li>No hay registros aún.</li>";
    return;
  }

  top3.forEach(([nombre, consumo], index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${nombre} – ${consumo.toFixed(2)} kWh`;
    listaTop.appendChild(li);
  });
}

// =========================
// Resumen semanal
// =========================
function mostrarResumenSemanal() {
  const contenido = document.getElementById("contenido-semanal");
  const consumoPorFecha = {};

  registros.forEach(reg => {
    const partes = reg.fecha.split("/");
    if (partes.length !== 3) return;
    const [dia, mes, anio] = partes;
    const fecha = new Date(`${anio}-${mes}-${dia}`);
    if (isNaN(fecha)) return;
    const clave = fecha.toISOString().split("T")[0];
    const consumo = (reg.watts * reg.horas) / 1000;
    consumoPorFecha[clave] = (consumoPorFecha[clave] || 0) + consumo;
  });

  const fechas = Object.keys(consumoPorFecha).sort();
  if (fechas.length < 7) {
    contenido.textContent = "Aún no hay suficientes datos para generar el resumen semanal.";
    return;
  }

  const ultimas7 = fechas.slice(-7);
  const total = ultimas7.reduce((sum, fecha) => sum + consumoPorFecha[fecha], 0);

  contenido.textContent = `En los últimos 7 días consumiste un total de ${total.toFixed(2)} kWh.`;
}

// =========================
// Historial mensual
// =========================
function getNombreMesActual() {
  const fecha = new Date();
  return fecha.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric"
  });
}

function guardarHistorial() {
  const config = planes[planActual];
  if (!config.historial) {
    alert("Guardar el historial mensual es una función del plan Pro o Empresa.");
    return;
  }
  const mes = getNombreMesActual();
  let historiales = JSON.parse(localStorage.getItem("historial_consumo")) || {};

  if (historiales[mes]) {
    if (!confirm(`Ya existe un historial para ${mes}. ¿Deseas sobrescribirlo?`)) return;
  }

  historiales[mes] = registros;
  localStorage.setItem("historial_consumo", JSON.stringify(historiales));
  actualizarSelectorHistorial();
  alert(`Historial para ${mes} guardado correctamente.`);
}

function actualizarSelectorHistorial() {
  const historiales = JSON.parse(localStorage.getItem("historial_consumo")) || {};
  selectorHistorial.innerHTML = '<option value="">-- Ver historial guardado --</option>';
  for (let mes in historiales) {
    const option = document.createElement("option");
    option.value = mes;
    option.textContent = mes;
    selectorHistorial.appendChild(option);
  }
}

function mostrarHistorial(mes) {
  const historiales = JSON.parse(localStorage.getItem("historial_consumo")) || {};
  const data = historiales[mes];
  if (!data) {
    alert("No hay datos para este mes.");
    return;
  }

  tbodyHistorial.innerHTML = "";
  data.forEach(reg => {
    const tr = document.createElement("tr");
    const consumo = (reg.watts * reg.horas / 1000).toFixed(2);
    tr.innerHTML = `
      <td>${reg.nombre}</td>
      <td>${reg.zona || "-"}</td>
      <td>${reg.watts}</td>
      <td>${reg.horas}</td>
      <td>${reg.fecha}</td>
      <td>${consumo}</td>
    `;
    tbodyHistorial.appendChild(tr);
  });
  tablaHistorial.style.display = "table";
}

function borrarHistorial() {
  const mes = selectorHistorial.value;
  if (!mes) {
    alert("Selecciona un mes a borrar.");
    return;
  }

  if (!confirm(`¿Estás seguro de eliminar el historial de ${mes}?`)) return;

  let historiales = JSON.parse(localStorage.getItem("historial_consumo")) || {};
  delete historiales[mes];
  localStorage.setItem("historial_consumo", JSON.stringify(historiales));
  actualizarSelectorHistorial();
  tbodyHistorial.innerHTML = "";
  tablaHistorial.style.display = "none";
  alert(`Historial de ${mes} eliminado.`);
}

// =========================
// Exportar CSV
// =========================
function exportarCSV() {
  if (registros.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }

  let csv = "Aparato,Zona,Potencia (W),Horas,Fecha,Consumo (kWh)\n";
  registros.forEach(reg => {
    const consumo = (reg.watts * reg.horas / 1000).toFixed(2);
    csv += `${reg.nombre},${reg.zona},${reg.watts},${reg.horas},${reg.fecha},${consumo}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "consumo_diario.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// =========================
// Reporte PDF mensual
// =========================
function generarReportePDF() {
  // 1) Decidir de dónde salen los datos: historial o registros actuales
  let registrosFuente = registros;
  let periodoTexto = "Mes en curso (registros actuales)";

  const historiales = JSON.parse(localStorage.getItem("historial_consumo")) || {};
  const mesSeleccionado = selectorHistorial ? selectorHistorial.value : "";

  if (mesSeleccionado && historiales[mesSeleccionado]) {
    registrosFuente = historiales[mesSeleccionado];
    periodoTexto = `Historial: ${mesSeleccionado}`;
  }

  if (!registrosFuente || registrosFuente.length === 0) {
    alert("No hay registros para generar el reporte.");
    return;
  }

  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("No se pudo cargar jsPDF. Revisa las etiquetas <script> de jsPDF.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // --------- Datos generales ----------
  const fechaHoy = new Date().toLocaleDateString("es-MX");
  let totalKWh = 0;
  const fechasUnicas = new Set();

  registrosFuente.forEach(reg => {
    const consumo = (reg.watts * reg.horas) / 1000;
    totalKWh += consumo;
    fechasUnicas.add(reg.fecha);
  });

  const costoTotal = (totalKWh * TARIFA_KWH);
  const dias = fechasUnicas.size || 1;
  const costoDia = costoTotal / dias;
  const costoMes = costoDia * 30;

  let metaTexto = "Sin meta establecida.";
  if (META_KWH !== null) {
    if (totalKWh > META_KWH) {
      metaTexto = `Meta mensual: ${META_KWH} kWh ➜ NO cumplida (Total: ${totalKWh.toFixed(2)} kWh).`;
    } else {
      metaTexto = `Meta mensual: ${META_KWH} kWh ➜ Cumplida (Total: ${totalKWh.toFixed(2)} kWh).`;
    }
  }

  const consumoPorZona = obtenerConsumoPorZona(registrosFuente);
  const zonasOrdenadas = Object.entries(consumoPorZona)
    .sort((a, b) => b[1] - a[1]);

  const consumoPorAparato = {};
  registrosFuente.forEach(reg => {
    const c = (reg.watts * reg.horas) / 1000;
    consumoPorAparato[reg.nombre] = (consumoPorAparato[reg.nombre] || 0) + c;
  });
  const topAparatos = Object.entries(consumoPorAparato)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const nombreInst = (inputInstitucion && inputInstitucion.value.trim()) || nombreInstitucion || "No especificada";

  // --------- Encabezado ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Reporte de consumo eléctrico", 14, 18);

  doc.setFontSize(11);
  doc.text(`Institución / empresa: ${nombreInst}`, 14, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha de generación: ${fechaHoy}`, 14, 32);
  doc.text(`Periodo del reporte: ${periodoTexto}`, 14, 37);
  doc.text(`País: ${selectPais.options[selectPais.selectedIndex].text}`, 14, 42);
  doc.text(`Plan: ${planes[planActual].nombre}`, 14, 47);

  // --------- Resumen general ----------
  let y = 54;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen general", 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total de energía consumida: ${totalKWh.toFixed(2)} kWh`, 14, y); y += 5;
  doc.text(`Costo aproximado total: $${costoTotal.toFixed(2)}`, 14, y); y += 5;
  doc.text(`Costo promedio por día: $${costoDia.toFixed(2)}`, 14, y); y += 5;
  doc.text(`Estimado mensual (30 días): $${costoMes.toFixed(2)}`, 14, y); y += 5;
  doc.text(metaTexto, 14, y); y += 8;

  // --------- Tabla: consumo por zona ----------
  if (zonasOrdenadas.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Consumo por zona", 14, y);
    y += 4;

    const bodyZonas = zonasOrdenadas.map(([zona, consumo]) => {
      const pct = totalKWh > 0 ? (consumo / totalKWh) * 100 : 0;
      return [zona, consumo.toFixed(2), `${pct.toFixed(1)} %`];
    });

    doc.autoTable({
      startY: y,
      head: [["Zona", "kWh totales", "% del total"]],
      body: bodyZonas,
      styles: { fontSize: 9 }
    });

    y = doc.lastAutoTable.finalY + 8;
  }

  // --------- Tabla: top aparatos ----------
  if (topAparatos.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Top aparatos más gastadores", 14, y);
    y += 4;

    const bodyTop = topAparatos.map(([nombre, consumo], i) => [
      i + 1,
      nombre,
      consumo.toFixed(2)
    ]);

    doc.autoTable({
      startY: y,
      head: [["#", "Aparato", "kWh"]],
      body: bodyTop,
      styles: { fontSize: 9 }
    });

    y = doc.lastAutoTable.finalY + 8;
  }

  // --------- Tabla: detalle de registros ----------
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de registros", 14, y);
  y += 4;

  const bodyRegistros = registrosFuente.map(reg => {
    const consumo = (reg.watts * reg.horas) / 1000;
    return [
      reg.nombre,
      reg.zona || "-",
      reg.watts,
      reg.horas,
      reg.fecha,
      consumo.toFixed(2)
    ];
  });

  doc.autoTable({
    startY: y,
    head: [["Aparato", "Zona", "W", "Horas", "Fecha", "kWh"]],
    body: bodyRegistros,
    styles: { fontSize: 8 }
  });

  // --------- Guardar ----------
  const sufijoPeriodo = mesSeleccionado
    ? mesSeleccionado.replace(/\s+/g, "_")
    : "mes_actual";

  const nombreArchivo = `reporte_consumo_${sufijoPeriodo}.pdf`;
  doc.save(nombreArchivo);
}

// =====================
// Modo oscuro 
// =====================
function inicializarModoOscuro() {

const toggleBtn = document.getElementById("modo-oscuro-toggle");

function aplicarTemaInicial() {
  const activado = localStorage.getItem("modoOscuro") === "true";

  if (activado) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }

  if (toggleBtn) {
    toggleBtn.textContent = activado ? "☀️" : "🌙";
  }
}

// Aplica el tema apenas cargue el JS
aplicarTemaInicial();

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const activadoNuevo = !document.body.classList.contains("dark-mode");

    if (activadoNuevo) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    localStorage.setItem("modoOscuro", activadoNuevo);
    toggleBtn.textContent = activadoNuevo ? "☀️" : "🌙";
  });
} else {
  console.warn("No se encontró el botón de modo oscuro con id 'modo-oscuro-toggle'");
}

}

// =========================
// Listeners
// =========================

// Formulario: zona personalizada toggle
zonaSelect.addEventListener("change", () => {
  if (zonaSelect.value === "Otra") {
    zonaPersonalizadaGrupo.style.display = "block";
  } else {
    zonaPersonalizadaGrupo.style.display = "none";
    zonaPersonalizadaInput.value = "";
  }
});

// Formulario principal
form.addEventListener("submit", e => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const watts = parseFloat(document.getElementById("potencia").value);
  const horas = parseFloat(document.getElementById("horas").value);
  const fecha = getFechaHoyEsMX();

  let zona = zonaSelect.value;
  if (zona === "Otra") {
    zona = zonaPersonalizadaInput.value.trim();
  }

  if (!nombre || isNaN(watts) || isNaN(horas) || !zona) return;

  // Control por plan
  const config = planes[planActual];
  const zonasUnicas = obtenerZonasUnicas();
  const yaExisteZona = zonasUnicas.includes(zona);
  const zonasTrasNuevo = yaExisteZona ? zonasUnicas.length : zonasUnicas.length + 1;

    // Límite de zonas
  if (zonasTrasNuevo > config.maxZonas) {
    alert(`Tu plan (${config.nombre}) solo permite ${config.maxZonas} zonas.\nHas alcanzado el límite.`);
    return;
  }

  // Límite de aparatos por zona (aparatos distintos)
  const nombresEnZona = new Set(
    registros
      .filter(r => r.zona === zona)
      .map(r => r.nombre.toLowerCase().trim())
  );
  const yaExisteAparato = nombresEnZona.has(nombre.toLowerCase().trim());
  const aparatosTrasNuevo = yaExisteAparato ? nombresEnZona.size : nombresEnZona.size + 1;

  if (aparatosTrasNuevo > config.maxAparatosPorZona) {
    alert(
      `Has alcanzado el máximo de aparatos en la zona "${zona}" para tu plan (${config.nombre}).\n` +
      `Límite: ${config.maxAparatosPorZona} aparatos por zona.`
    );
    return;
  }

  // Límite de registros totales
  if (registros.length >= config.maxRegistros) {
    alert(`Tu plan (${config.nombre}) alcanzó el máximo de ${config.maxRegistros} registros.`);
    return;
  }


  if (zonasTrasNuevo > config.maxZonas) {
    alert(`Tu plan (${config.nombre}) solo permite ${config.maxZonas} zonas.\nHas alcanzado el límite.`);
    return;
  }

  if (registros.length >= config.maxRegistros) {
    alert(`Tu plan (${config.nombre}) alcanzó el máximo de ${config.maxRegistros} registros.`);
    return;
  }

  registros.push({ nombre, watts, horas, fecha, zona });
  guardarRegistros();
  mostrarRegistros();
  form.reset();
  zonaSelect.value = "Sala";
  zonaPersonalizadaGrupo.style.display = "none";
  zonaPersonalizadaInput.value = "";
  mostrarTip();
  mostrarAlerta();
});

// Borrar todos
borrarBtn.addEventListener("click", () => {
  if (confirm("¿Seguro que deseas borrar todos los registros?")) {
    registros = [];
    guardarRegistros();
    mostrarRegistros();
  }
});

// Cambio país
selectPais.addEventListener("change", () => {
  TARIFA_KWH = tarifasPorPais[selectPais.value];
  mostrarRegistros();
});

// Meta mensual
formMeta.addEventListener("submit", e => {
  e.preventDefault();
  const valor = parseFloat(inputMeta.value);
  if (!isNaN(valor) && valor > 0) {
    META_KWH = valor;
    localStorage.setItem("meta_kwh", valor);
    mostrarRegistros();
  }
});

// Navegación tabs
document.querySelectorAll(".nav-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const seccion = document.getElementById(btn.dataset.seccion);
    if (seccion) {
      seccion.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Botón arriba
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    btnArriba.style.display = "block";
  } else {
    btnArriba.style.display = "none";
  }
});

btnArriba.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Exportar CSV
exportarBtn.addEventListener("click", exportarCSV);

// Botón reporte PDF
if (btnReportePDF) {
  btnReportePDF.addEventListener("click", () => {
    const config = planes[planActual];
    if (!config.pdf) {
      alert("El reporte PDF es una función disponible en los planes Pro y Empresa.");
      return;
    }
    generarReportePDF();
  });
}

// Delegación para eliminar filas
tablaBody.addEventListener("click", e => {
  if (e.target.classList.contains("btn-eliminar")) {
    const index = parseInt(e.target.dataset.index, 10);
    if (!isNaN(index)) {
      registros.splice(index, 1);
      guardarRegistros();
      mostrarRegistros();
    }
  }
});

// Historial eventos
btnGuardarMes.addEventListener("click", guardarHistorial);
selectorHistorial.addEventListener("change", () => {
  if (selectorHistorial.value) {
    mostrarHistorial(selectorHistorial.value);
  } else {
    tbodyHistorial.innerHTML = "";
    tablaHistorial.style.display = "none";
  }
});
btnBorrarHistorial.addEventListener("click", borrarHistorial);

// Cambio de plan
selectPlan.addEventListener("change", () => {
  planActual = selectPlan.value;
  localStorage.setItem("plan_consumo", planActual);
  actualizarPanelPlan();
  actualizarFeaturesPorPlan();
  mostrarRegistros();
  });

  // Botones de las tarjetas de planes
planButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const planDestino = btn.dataset.plan;
    if (!planDestino) return;

    // Cambiamos el select visualmente
    selectPlan.value = planDestino;

    // Actualizamos el estado de la app
    planActual = planDestino;
    localStorage.setItem("plan_consumo", planActual);
    actualizarPanelPlan();
    actualizarFeaturesPorPlan();
    mostrarRegistros();

    // Scroll al hero para ver el plan actual
    const hero = document.getElementById("hero");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth" });
    }
  });
});


// =========================
// Inicialización
// =========================
inicializarModoOscuro();
actualizarSelectorHistorial();
mostrarRegistros();
mostrarTip();
actualizarPanelPlan();
actualizarFeaturesPorPlan();
