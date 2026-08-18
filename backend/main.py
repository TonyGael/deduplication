from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from extractors.txt_extractor import extraer_texto_txt
from extractors.docx_extractor import extraer_texto_docx
from extractors.pdf_extractor import extraer_texto_pdf
from dedup.chunker import dividir_en_chunks
from dedup.embedder import generar_embeddings
from dedup.deduplicator import deduplicar
from models import RespuestaExtraccion, SolicitudDeduplicacion, RespuestaDeduplicacion

app = FastAPI(title="Deduplicación Semántica de Docuemntos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:500"],
    allow_methods=["*"],
    allow_headers=["*"],
)

EXTRACTORES = {
    "txt": extraer_texto_txt,
    "docx": extraer_texto_docx,
    "pdf": extraer_texto_pdf,
}

@app.post("/extraer", response_model=RespuestaExtraccion)
async def extraer(archivo: UploadFile):

    extension = archivo.filename.split(".")[-1].lower()
    extractor = EXTRACTORES.get(extension)
    if extractor is None:
        raise HTTPException(400, f"Formato .{extension} no soportado (usa txt, docx o pdf)")

    contenido = await archivo.read()
    texto = extractor(contenido)
    chunks = dividir_en_chunks(texto)

    return RespuestaExtraccion(
        texto_completo=texto,
        chunks=chunks,
        total_chunks=len(chunks),
    )

@app.post("/deduplicar", response_model=RespuestaDeduplicacion)
async def endpoint_deduplicar(solicitud: SolicitudDeduplicacion):
    if len(solicitud.chunks) < 2:
        raise HTTPException(400, "Se necesitan al menos 2 chunks para comparar")

    embeddings = generar_embeddings(solicitud.chunks)
    resultado = deduplicar(solicitud.chunks, embeddings, solicitud.umbral)
    return resultado