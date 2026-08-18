from pydantic import BaseModel

class ChunkEliminado(BaseModel):
    texto: str
    duplicado_de: str
    score: float

class RespuestaExtraccion(BaseModel):
    texto_completo: str
    chunks: list[str]
    total_chunks: int

class SolicitudDeduplicacion(BaseModel):
    chunks: list[str]
    umbral: float = 0.87

class RespuestaDeduplicacion(BaseModel):
    total_original: int
    total_unicos: int
    total_eliminados: int
    documento_depurado: str
    eliminados: list[ChunkEliminado]
