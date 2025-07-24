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
let registros = JSON.parse(localStorage.getItem("registros_consumo")) || [];

const tips = [
  "Desconecta aparatos que no usas para ahorrar hasta un 15%",
  "Utiliza focos LED: consumen 80% menos",
  "Ajusta tu aire acondicionado a 24°C para mejor eficiencia",
  "Plancha toda tu ropa en una sola sesión para ahorrar energía",
  "No abras el refrigerador innecesariamente",
  "Lava con agua fría cuando sea posible"
];

const ctx = document.getElementById('grafica-consumo').getContext('2d');
let graficaConsumo;

form.addEventListener("submit", e => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const watts = parseFloat(document.getElementById("potencia").value);
  const horas = parseFloat(document.getElementById("horas").value);
  const fecha = new Date().toLocaleDateString('es-MX');

  if (!nombre || isNaN(watts) || isNaN(horas)) return;

  registros.push({ nombre, watts, horas, fecha });
  guardarRegistros();
  mostrarRegistros();
  form.reset();
  mostrarTip();

  mostrarAlerta();
});

function mostrarAlerta() {
  const alerta = document.getElementById("alerta-registro");
  alerta.style.display = "block";
  alerta.classList.remove("fadeout");

  setTimeout(() => {
    alerta.style.display = "none";
  }, 2000);
}

borrarBtn.addEventListener("click", () => {
  if (confirm("¿Seguro que deseas borrar todos los registros?")) {
    registros = [];
    guardarRegistros();
    mostrarRegistros();
  }
});

selectPais.addEventListener("change", () => {
  TARIFA_KWH = tarifasPorPais[selectPais.value];
  mostrarRegistros();
});

function guardarRegistros() {
  localStorage.setItem("registros_consumo", JSON.stringify(registros));
}

function mostrarTip() {
  const random = Math.floor(Math.random() * tips.length);
  tipTexto.textContent = tips[random];
}
setInterval(() => {
  mostrarTip();
}, 15000); 

function mostrarRegistros() {
 tablaBody.innerHTML = "";
let totalKWh = 0;
const fechasUnicas = new Set();

registros.forEach((reg, index) => {
  const tr = document.createElement("tr");
  const consumo = (reg.watts * reg.horas / 1000).toFixed(2);
  totalKWh += parseFloat(consumo);
  fechasUnicas.add(reg.fecha);

document.querySelectorAll(".btn-eliminar").forEach(btn => {
  btn.addEventListener("click", e => {
    const i = e.target.dataset.index;
    registros.splice(i, 1);
    guardarRegistros();
    mostrarRegistros();
    mostrarResumenSemanal();
  });
});


  tr.innerHTML = `
    <td>${reg.nombre}</td>
    <td>${reg.watts}</td>
    <td>${reg.horas}</td>
    <td>${reg.fecha}</td>
    <td>${consumo}</td>
    <td><button class="btn-eliminar" data-index="${index}">🗑️</button></td>
  `;
  tablaBody.appendChild(tr);
});


  const costo = (totalKWh * TARIFA_KWH).toFixed(2);
  const dias = fechasUnicas.size || 1;
  const costoDia = (costo / dias).toFixed(2);
  const costoMes = (costoDia * 30).toFixed(2);

  resumenTexto.textContent = `Total kWh: ${totalKWh.toFixed(2)} | Costo aprox.: $${costo}`;
  resumenDiaMes.textContent = `Costo por día: $${costoDia} | Estimado mensual: $${costoMes}`;
  actualizarGrafica();
  actualizarGraficaPorAparato();
  mostrarTopAparatos();
  if (META_KWH !== null) {
  if (totalKWh > META_KWH) {
    estadoMeta.textContent = `⚠️ Has superado tu meta mensual de ${META_KWH} kWh. Total: ${totalKWh.toFixed(2)} kWh`;
    estadoMeta.style.color = "#d50000";
  } else {
    estadoMeta.textContent = `✅ Vas bien: ${totalKWh.toFixed(2)} / ${META_KWH} kWh`;
    estadoMeta.style.color = "#00c853";
  }
} else {
  estadoMeta.textContent = "Aún no has definido una meta.";
  estadoMeta.style.color = "";
}

}

function actualizarGrafica() {
  const registrosGraficos = JSON.parse(localStorage.getItem('registros_consumo')) || [];
  const consumoPorDia = {};

  registrosGraficos.forEach(registro => {
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
    type: 'bar',
    data: {
      labels: fechas,
      datasets: [{
        label: 'Consumo (kWh)',
        data: valores,
        backgroundColor: '#0077ff',
        barThickness: fechas.length === 1 ? 40 : undefined,
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      },
      plugins: {
        legend: {
          labels: {
            boxWidth: 20,
            padding: 10
          }
        }
      }
    }
  });
}

const toggleBtn = document.getElementById('modo-oscuro-toggle');
if (localStorage.getItem('modoOscuro') === 'true') {
  document.body.classList.add('dark-mode');
  toggleBtn.textContent = '☀️ Modo Claro';
}
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const activado = document.body.classList.contains('dark-mode');
  localStorage.setItem('modoOscuro', activado);
  toggleBtn.textContent = activado ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
});

mostrarRegistros();
mostrarTip();




const btnGuardarMes = document.getElementById("guardar-mes");
const selectorHistorial = document.getElementById("selector-historial");
const tablaHistorial = document.getElementById("tabla-historial");
const tbodyHistorial = tablaHistorial.querySelector("tbody");
const btnBorrarHistorial = document.getElementById("borrar-historial");

function getNombreMesActual() {
  const fecha = new Date();
  return fecha.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
}

function guardarHistorial() {
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

actualizarSelectorHistorial();

function actualizarGraficaPorAparato() {
  const consumoPorAparato = {};

  registros.forEach(reg => {
    const consumo = (reg.watts * reg.horas) / 1000;
    consumoPorAparato[reg.nombre] = (consumoPorAparato[reg.nombre] || 0) + consumo;
  });

  const aparatos = Object.keys(consumoPorAparato);
  const valores = Object.values(consumoPorAparato);

  const ctxAparato = document.getElementById('grafica-aparato').getContext('2d');

  if (window.graficaAparato) window.graficaAparato.destroy();

  window.graficaAparato = new Chart(ctxAparato, {
    type: 'pie',
    data: {
      labels: aparatos,
      datasets: [{
        data: valores,
        backgroundColor: [
          '#0077ff', '#00c853', '#ff8f00', '#d50000',
          '#6a1b9a', '#0097a7', '#c51162', '#33691e'
        ],
        borderColor: '#fff',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.parsed.toFixed(2)} kWh`;
            }
          }
        }
      }
    }
  });
}
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
const btnArriba = document.getElementById("btn-arriba");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    btnArriba.style.display = "block";
  } else {
    btnArriba.style.display = "none";
  }
});

btnArriba.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

const exportarBtn = document.getElementById("exportar-csv");
exportarBtn.addEventListener("click", exportarCSV);

function exportarCSV() {
  if (registros.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }

  let csv = "Aparato,Potencia (W),Horas,Fecha,Consumo (kWh)\n";
  registros.forEach(reg => {
    const consumo = (reg.watts * reg.horas / 1000).toFixed(2);
    csv += `${reg.nombre},${reg.watts},${reg.horas},${reg.fecha},${consumo}\n`;
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
function mostrarResumenSemanal() {
  const contenido = document.getElementById("contenido-semanal");
  const consumoPorFecha = {};

  registros.forEach(reg => {
    const [dia, mes, anio] = reg.fecha.split("/");
    const fecha = new Date(`${anio}-${mes}-${dia}`);
    const clave = fecha.toISOString().split("T")[0]; // formato YYYY-MM-DD
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
formMeta.addEventListener("submit", e => {
  e.preventDefault();
  const valor = parseFloat(inputMeta.value);
  if (!isNaN(valor) && valor > 0) {
    META_KWH = valor;
    localStorage.setItem("meta_kwh", valor);
    mostrarRegistros();
  }
});