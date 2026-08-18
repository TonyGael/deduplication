const API_BASE = "http://127.0.0.1:8000";

let chunksActuales = [];

const inputArchivo = document.getElementById("input-archivo");
const btnExtraer = document.getElementById("btn-extraer");
const btnDeduplicar = document.getElementById("btn-deduplicar");
const sliderUmbral = document.getElementById("slider-umbral");
const valorUmbral = document.getElementById("valor-umbral");

sliderUmbral.addEventListener("input", () => {
  valorUmbral.textContent = sliderUmbral.value;
});

btnExtraer.addEventListener("click", async () => {
  const archivo = inputArchivo.files[0];
  if (!archivo) {
    alert("Elegí un archivo primero");
    return;
  }

  const formData = new FormData();
  formData.append("archivo", archivo);

  btnExtraer.disabled = true;
  btnExtraer.textContent = "Extrayendo...";

  try {
    const respuesta = await fetch(`${API_BASE}/extraer`, {
      method: "POST",
      body: formData,
    });

    if (!respuesta.ok) {
      const error = await respuesta.json();
      throw new Error(error.detail || "Error al extraer el texto");
    }

    const datos = await respuesta.json();
    chunksActuales = datos.chunks;

    mostrarChunksOriginales(chunksActuales, []);
    document.getElementById("seccion-umbral").classList.remove("oculto");

  } catch (err) {
    alert(err.message);
  } finally {
    btnExtraer.disabled = false;
    btnExtraer.textContent = "1. Extraer texto";
  }
});

btnDeduplicar.addEventListener("click", async () => {
  btnDeduplicar.disabled = true;
  btnDeduplicar.textContent = "Procesando...";

  try {
    const respuesta = await fetch(`${API_BASE}/deduplicar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chunks: chunksActuales,
        umbral: parseFloat(sliderUmbral.value),
      }),
    });

    if (!respuesta.ok) {
      const error = await respuesta.json();
      throw new Error(error.detail || "Error al deduplicar");
    }

    const resultado = await respuesta.json();
    mostrarResultados(resultado);

  } catch (err) {
    alert(err.message);
  } finally {
    btnDeduplicar.disabled = false;
    btnDeduplicar.textContent = "2. Deduplicar";
  }
});

function mostrarChunksOriginales(chunks, eliminados) {
  const contenedor = document.getElementById("chunks-original");
  contenedor.innerHTML = "";

  const textosEliminados = new Set(eliminados.map(e => e.texto));

  chunks.forEach(texto => {
    const div = document.createElement("div");
    div.className = textosEliminados.has(texto) ? "chunk eliminado" : "chunk";
    div.textContent = texto;
    contenedor.appendChild(div);
  });

  document.getElementById("seccion-resultados").classList.remove("oculto");
}

function mostrarResultados(resultado) {
  document.getElementById("stat-original").textContent =
    `Original: ${resultado.total_original} chunks`;
  document.getElementById("stat-unicos").textContent =
    `Únicos: ${resultado.total_unicos} chunks`;
  document.getElementById("stat-eliminados").textContent =
    `Eliminados: ${resultado.total_eliminados} chunks`;

  mostrarChunksOriginales(chunksActuales, resultado.eliminados);
  document.getElementById("documento-depurado").textContent = resultado.documento_depurado;
}