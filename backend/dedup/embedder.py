from model2vec import StaticModel

_modelo = StaticModel.from_pretrained("minishlab/potion-multilingual-128M")

def generar_embeddings(chunks: list[str]):
    return _modelo.encode(chunks)
