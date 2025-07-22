const form = document.getElementById("form-aparato");
const tablaBody = document.querySelector("#tabla-registros tbody");
const resumenTexto = document.getElementById("resumen-consumo");
const resumenDiaMes = document.getElementById("resumen-dia-mes");
const borrarBtn = document.getElementById("borrar-todo");
const tipTexto = document.getElementById("tip-texto");
const selectPais = document.getElementById("pais");

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
});

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

function mostrarRegistros() {
  tablaBody.innerHTML = "";
  let totalKWh = 0;
  const fechasUnicas = new Set();

  registros.forEach(reg => {
    const tr = document.createElement("tr");
    const consumo = (reg.watts * reg.horas / 1000).toFixed(2);
    totalKWh += parseFloat(consumo);
    fechasUnicas.add(reg.fecha);

    tr.innerHTML = `
      <td>${reg.nombre}</td>
      <td>${reg.watts}</td>
      <td>${reg.horas}</td>
      <td>${reg.fecha}</td>
      <td>${consumo}</td>
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


// === HISTORIAL MENSUAL ===

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
