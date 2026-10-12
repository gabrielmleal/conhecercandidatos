import datetime
import json
import pathlib
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
MOTIVO = {"1": "fonte fora da lista", "2": "sem âncora oficial ou dupla", "3": "trecho não encontrado na página", "4": "número sem apoio no trecho",
          "5": "fato repetido", "6": "palavra carregada", "7": "as três revisões não concordaram", "8": "o texto vai além do trecho", "9": "o espelho deu outro tipo"}
HOJE = datetime.date.today()


def ler(p):
    return json.loads(p.read_text(encoding="utf-8"))


def gravar(p, dado):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(dado, ensure_ascii=False, indent=1), encoding="utf-8")


def registrar(nome, item):
    caminho = RAIZ / "registros" / nome
    gravar(caminho, (ler(caminho) if caminho.exists() else []) + [item])


def publicar(r):
    destino = RAIZ / "fatos" / f"{r['id']}.json"
    antigo = ler(destino) if destino.exists() else None
    tipo = r["classificacao"]
    fato = {k: v for k, v in r.items() if k not in ("classificacao", "peso_final", "para_quem_final", "reavaliando")}
    fato.update({"tipo": tipo, "para_quem": r.get("para_quem_final", []), "peso": r["peso_final"] if tipo in ("positivo", "problema") else 0, "conferido_em": HOJE.isoformat(),
                 "reavaliar_em": (HOJE + datetime.timedelta(days=7)).isoformat(), "versao": antigo["versao"] + 1 if antigo else 1,
                 "publicado_em": antigo["publicado_em"] if antigo else HOJE.isoformat()})
    if antigo and (antigo["tipo"], antigo["frase"]) != (fato["tipo"], fato["frase"]):
        registrar("mudancas.json", {"data": HOJE.isoformat(), "id": r["id"], "titulo": fato["titulo"], "o_que": f"Passou de {antigo['tipo']} para {fato['tipo']}." if antigo["tipo"] != fato["tipo"] else "O texto foi corrigido.", "motivo": "Reconferência semanal."})
    gravar(destino, fato)
    (RAIZ / "quarentena" / f"{r['id']}.json").unlink(missing_ok=True)


def quarentena(r, falhas):
    destino = RAIZ / "quarentena" / f"{r['id']}.json"
    antes = ler(destino) if destino.exists() else {}
    gravar(destino, {**r, "falhas": [MOTIVO[f] for f in falhas], "entrou_em": antes.get("entrou_em", HOJE.isoformat())})
    publicado = RAIZ / "fatos" / f"{r['id']}.json"
    if r.get("reavaliando") and publicado.exists():
        publicado.unlink()
        registrar("mudancas.json", {"data": HOJE.isoformat(), "id": r["id"], "titulo": r["titulo"], "o_que": "Retirado do site.", "motivo": "Na reconferência, " + MOTIVO[falhas[0]] + "."})


def decidir():
    publicados, presos = 0, 0
    for p in sorted((RAIZ / "rascunhos").glob("*.json")):
        r = ler(p)
        caixas = r.get("caixas", {})
        falhas = [k for k in sorted(caixas) if not caixas[k]]
        if not falhas and len(caixas) < 9:
            continue
        if falhas:
            quarentena(r, falhas)
            presos += 1
        else:
            publicar(r)
            publicados += 1
        p.unlink()
    total = publicados + presos
    if total and presos / total > 0.3:
        (RAIZ / "estado/pausa").write_text(f"{presos} de {total} fatos falharam em {HOJE.isoformat()}\n", encoding="utf-8")
    print(f"{publicados} publicados, {presos} em quarentena")


def voltar():
    for p in sorted((RAIZ / "quarentena").glob("*.json")):
        r = ler(p)
        dias = (HOJE - datetime.date.fromisoformat(r["entrou_em"])).days
        if dias >= 7:
            registrar("descartados.json", {"data": HOJE.isoformat(), "id": r["id"], "titulo": r["titulo"], "motivo": "; ".join(r["falhas"])})
            p.unlink()
        elif dias < 1:
            limpo = {k: v for k, v in r.items() if k not in ("caixas", "revisao", "classificacao", "peso_final", "para_quem_final", "falhas", "copias", "hash", "provado_em")}
            gravar(RAIZ / "rascunhos" / p.name, limpo)


if __name__ == "__main__":
    {"decidir": decidir, "voltar": voltar}[sys.argv[1]]()
