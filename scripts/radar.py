import json
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
MANDATOS = {"lula": [("l1", "2003", "2006"), ("l2", "2007", "2010"), ("l3", "2023", "2026")], "flavio": [("b", "2019", "2022")]}


def mandato(fato):
    for nome, inicio, fim in MANDATOS.get(fato["candidato"], []):
        if inicio <= fato["data"][:4] <= fim:
            return nome
    return "-"


temas = json.loads((RAIZ / "dados/temas.json").read_text(encoding="utf-8"))
fatos = [json.loads(p.read_text(encoding="utf-8")) for pasta in ("fatos", "rascunhos") for p in sorted((RAIZ / pasta).glob("*.json"))]
lacunas = []
for tema, info in temas.items():
    for subtema in info["subtemas"]:
        for candidato, mandatos in MANDATOS.items():
            celulas = [m for m, _, _ in mandatos] if info["governo"] else ["-"]
            for m in celulas:
                n = sum(1 for f in fatos if (f["candidato"], f.get("tema"), f.get("subtema")) == (candidato, tema, subtema) and (m == "-" or mandato(f) == m))
                lacunas.append({"candidato": candidato, "tema": tema, "subtema": subtema, "mandato": m, "fatos": n})
lacunas.sort(key=lambda c: (c["fatos"], c["tema"], c["subtema"], c["candidato"]))
(RAIZ / "fila/lacunas.json").write_text(json.dumps(lacunas, ensure_ascii=False, indent=1), encoding="utf-8")
vazias = [c for c in lacunas if not c["fatos"]]
print(f"{len(vazias)} de {len(lacunas)} células sem fato")
for lado in MANDATOS:
    print(lado, sum(1 for f in fatos if f["candidato"] == lado), "fatos")
