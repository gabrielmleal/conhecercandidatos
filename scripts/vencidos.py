import datetime
import json
import pathlib
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
hoje = datetime.date.today().isoformat()
pedidos = set(sys.argv[1:])
LIMPAR = ("caixas", "revisao", "copias", "hash", "provado_em", "conferido_em", "reavaliar_em")
n = 0
for p in sorted((RAIZ / "fatos").glob("*.json")):
    fato = json.loads(p.read_text(encoding="utf-8"))
    if fato["reavaliar_em"] <= hoje or fato["id"] in pedidos:
        rascunho = {k: v for k, v in fato.items() if k not in LIMPAR} | {"reavaliando": True}
        (RAIZ / "rascunhos" / p.name).write_text(json.dumps(rascunho, ensure_ascii=False, indent=1), encoding="utf-8")
        n += 1
print(n, "fatos voltaram para reconferência")
