const API_BASE = "http://127.0.0.1:8000";

let chunksActuales = [];
let idiomaActual = localStorage.getItem("idioma") || "es";

const TRADUCCIONES = {
  es: {
    titulo: "Deduplicación Semántica",
    subtitulo: "Subí un documento (.txt, .docx o .pdf) y detectá contenido redundante usando embeddings.",
    btn_extraer: "1. Extraer texto",
    btn_extraer_cargando: "Extrayendo...",
    label_umbral: "Umbral de similitud:",
    btn_deduplicar: "2. Deduplicar",
    btn_deduplicar_cargando: "Procesando...",
    col_original: "Documento original",
    col_depurado: "Documento depurado (lo vital)",
    alerta_sin_archivo: "Elegí un archivo primero",
    error_extraer: "Error al extraer el texto",
    error_deduplicar: "Error al deduplicar",
    stat_original: (n) => `Original: ${n} chunks`,
    stat_unicos: (n) => `Únicos: ${n} chunks`,
    stat_eliminados: (n) => `Eliminados: ${n} chunks`,
  },
  en: {
    titulo: "Semantic Deduplication",
    subtitulo: "Upload a document (.txt, .docx or .pdf) and detect redundant content using embeddings.",
    btn_extraer: "1. Extract text",
    btn_extraer_cargando: "Extracting...",
    label_umbral: "Similarity threshold:",
    btn_deduplicar: "2. Deduplicate",
    btn_deduplicar_cargando: "Processing...",
    col_original: "Original document",
    col_depurado: "Deduplicated document (the essentials)",
    alerta_sin_archivo: "Choose a file first",
    error_extraer: "Error extracting text",
    error_deduplicar: "Error deduplicating",
    stat_original: (n) => `Original: ${n} chunks`,
    stat_unicos: (n) => `Unique: ${n} chunks`,
    stat_eliminados: (n) => `Removed: ${n} chunks`,
  },
};

function t(clave) {
  return TRADUCCIONES[idiomaActual][clave] || clave;
}

function aplicarIdioma(idioma) {
  idiomaActual = idioma;
  localStorage.setItem("idioma", idioma);
  document.documentElement.lang = idioma;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const clave = el.getAttribute("data-i18n");
    el.textContent = t(clave);
  });

  document.querySelectorAll(".btn-idioma").forEach((btn) => {
    btn.classList.toggle("activo", btn.dataset.lang === idioma);
  });

  if (!document.getElementById("seccion-resultados").classList.contains("oculto")) {
    if (ultimoResultado) mostrarResultados(ultimoResultado);
  }
}

document.querySelectorAll(".btn-idioma").forEach((btn) => {
  btn.addEventListener("click", () => aplicarIdioma(btn.dataset.lang));
});

aplicarIdioma(idiomaActual);

const inputArchivo = document.getElementById("input-archivo");
const btnExtraer = document.getElementById("btn-extraer");
const btnDeduplicar = document.getElementById("btn-deduplicar");
const sliderUmbral = document.getElementById("slider-umbral");
const valorUmbral = document.getElementById("valor-umbral");

let ultimoResultado = null;

sliderUmbral.addEventListener("input", () => {
  valorUmbral.textContent = sliderUmbral.value;
});

btnExtraer.addEventListener("click", async () => {
  const archivo = inputArchivo.files[0];
  if (!archivo) {
    alert(t("alerta_sin_archivo"));
    return;
  }

  const formData = new FormData();
  formData.append("archivo", archivo);

  btnExtraer.disabled = true;
  btnExtraer.textContent = t("btn_extraer_cargando");

  try {
    const respuesta = await fetch(`${API_BASE}/extraer`, {
      method: "POST",
      body: formData,
    });

    if (!respuesta.ok) {
      const error = await respuesta.json();
      throw new Error(error.detail || t("error_extraer"));
    }

    const datos = await respuesta.json();
    chunksActuales = datos.chunks;

    mostrarChunksOriginales(chunksActuales, []);
    document.getElementById("seccion-umbral").classList.remove("oculto");

  } catch (err) {
    alert(err.message);
  } finally {
    btnExtraer.disabled = false;
    btnExtraer.textContent = t("btn_extraer");
  }
});

btnDeduplicar.addEventListener("click", async () => {
  btnDeduplicar.disabled = true;
  btnDeduplicar.textContent = t("btn_deduplicar_cargando");

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
      throw new Error(error.detail || t("error_deduplicar"));
    }

    const resultado = await respuesta.json();
    ultimoResultado = resultado;
    mostrarResultados(resultado);

  } catch (err) {
    alert(err.message);
  } finally {
    btnDeduplicar.disabled = false;
    btnDeduplicar.textContent = t("btn_deduplicar");
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
  document.getElementById("stat-original").textContent = t("stat_original")(resultado.total_original);
  document.getElementById("stat-unicos").textContent = t("stat_unicos")(resultado.total_unicos);
  document.getElementById("stat-eliminados").textContent = t("stat_eliminados")(resultado.total_eliminados);

  mostrarChunksOriginales(chunksActuales, resultado.eliminados);
  document.getElementById("documento-depurado").textContent = resultado.documento_depurado;
}