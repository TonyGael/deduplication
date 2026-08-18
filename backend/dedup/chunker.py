def dividir_en_chunks(texto: str) -> list[str]:
    crudos = texto.split("\n\n")
    chunks = [c.strip() for c in crudos if len(c.strip()) >= 15]
    return chunks
