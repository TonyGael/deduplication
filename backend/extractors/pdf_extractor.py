from io import BytesIO
from pypdf import PdfReader

def extraer_texto_pdf(contenido: bytes) -> str:
    lector = PdfReader(BytesIO(contenido))
    
    paginas = [pagina.extract_text() or "" for pagina in lector.pages]
    
    return "\n\n".jpin(paginas)
