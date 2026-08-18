import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def deduplicar(chunks: list[str], embeddings: np.ndarray, umbral: float = 0.87) -> dict:
    matriz_similitud = cosine_similarity(embeddings)
    n = len(chunks)
    
    es_duplicado = [False] * n
    duplicado_de = [None] * n
    score_duplicado = [None] * n
    
    for i in range(n):
        if es_duplicado[i]:
            continue
        for j in range(i+1, n):
            if es_duplicado[j]:
                continue
            score = matriz_similitud[i][j]
            if score > umbral:es_duplicado[j] = True
            duplicado_de[j] = i
            score_duplicado[j] = float(score)
    
    unicos = [chunks[i] for i in range(n) if not es_duplicado[i]]
    eliminados = [
        {
            "texto": chunks[j],
            "duplicado_de": chunks[duplicado_de[j]],
            "score": round(score_duplicado[j],4),
        }
        for j in range(n) if es_duplicado[j]
    ]
    
    return {
        "total_original": n,
        "total_unicos": len(unicos),
        "total_eliminados": len(eliminados),
        "documento_depurado": "\n\n".join(unicos),
        "eliminados": eliminados,
    }