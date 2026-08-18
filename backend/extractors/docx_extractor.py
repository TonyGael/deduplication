from io import BytesIO
from docx import Document

def extraer_texto_docx(contendido: bytes) -> str:
    documento = Document(BytesIO(contendido))
    
    parrafos = [p.text.strip() for p in documento.paragraphs if p.text.strip()]
    
    return "\n\n".join(parrafos)
