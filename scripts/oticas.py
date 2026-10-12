import datetime
import json
import pathlib
import random
import re
import string
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
LOTES = RAIZ / "registros/lotes"
OTICAS = ["favor", "contra", "neutra"]
PESSOAS = ["Luiz Inácio Lula da Silva", "Lula", "Lulinha", "Fábio Luís", "Janja", "Rosângela da Silva", "Flávio Bolsonaro", "Flávio Nantes Bolsonaro", "Flávio",
           "Jair Messias Bolsonaro", "Jair Bolsonaro", "Jair", "Bolsonaro", "Michelle Bolsonaro", "Michelle", "Eduardo Bolsonaro", "Carlos Bolsonaro", "Renan Bolsonaro",
           "Geraldo Alckmin", "Alckmin", "Alfredo Gaspar", "Hamilton Mourão", "Mourão", "Dilma Rousseff", "Dilma", "Michel Temer", "Temer", "Fernando Haddad", "Haddad",
           "Paulo Guedes", "Guedes", "Sergio Moro", "Sérgio Moro", "Moro", "Fabrício Queiroz", "Queiroz", "José Dirceu", "Carlos Lupi", "Lupi", "Marina Silva",
           "Ricardo Salles", "Eduardo Pazuello", "Pazuello", "Marcelo Queiroga", "Nísia Trindade", "Alexandre Padilha", "Gleisi Hoffmann", "Valdemar Costa Neto",
           "Augusto Heleno", "Walter Braga Netto", "Braga Netto", "Anderson Torres", "Mauro Cid", "Alexandre Ramagem", "Ramagem", "Damares Alves", "Damares",
           "Tarcísio de Freitas", "Tarcísio", "Arthur Lira", "Rodrigo Pacheco", "Hugo Motta", "Davi Alcolumbre", "Daniel Vorcaro", "Ernesto Araújo", "Abraham Weintraub",
           "Weintraub", "Milton Ribeiro", "Camilo Santana", "Wellington Dias", "Rui Costa", "Simone Tebet", "Silvio Almeida", "Ciro Nogueira", "Onyx Lorenzoni",
           "Alexandre de Moraes", "Moraes", "Paulo Figueiredo", "Cristiano Zanin", "Zanin", "Flávio Dino", "Dino", "Jorge Messias", "Messias", "Donald Trump", "Trump",
           "Gaspar", "Fábio Luís Lula da Silva", "Lula da Silva", "Paulo Gonet", "Gonet", "Augusto Aras", "Aras", "Wolney Queiroz", "Vinícius Carvalho", "Gilmar Mendes", "Dias Toffoli", "Toffoli", "Cármen Lúcia", "Luís Roberto Barroso", "Barroso", "Edson Fachin", "Fachin", "Luiz Fux", "Fux", "André Mendonça", "Nunes Marques", "Javier Milei", "Milei", "Nicolás Maduro", "Maduro"]
PARTIDOS = ["Partido dos Trabalhadores", "Partido Liberal", "PCdoB", "PSDB", "PSOL", "PSB", "MDB", "PDT", "PSD", "PT", "PL", "PP", "Republicanos", "União Brasil", "Podemos"]
PROGRAMAS = ["Bolsa Família", "Auxílio Brasil", "Auxílio Emergencial", "Auxílio Gás", "Mais Médicos", "Médicos pelo Brasil", "Minha Casa, Minha Vida", "Minha Casa Minha Vida",
             "Casa Verde e Amarela", "Farmácia Popular", "Novo PAC", "PAC", "Desenrola", "Pé-de-Meia", "Fome Zero", "ProUni", "Prouni", "Fies", "Luz para Todos",
             "Brasil Sorridente", "Pronampe", "Future-se", "Gás do Povo", "Brasil Carinhoso"]
MESMA = [["Luiz Inácio Lula da Silva", "Lula da Silva", "Lula"], ["Jair Messias Bolsonaro", "Jair Bolsonaro", "Jair", "Bolsonaro"], ["Flávio Bolsonaro", "Flávio Nantes Bolsonaro", "Flávio"],
         ["Michelle Bolsonaro", "Michelle"], ["Fábio Luís Lula da Silva", "Fábio Luís", "Lulinha"], ["Rosângela da Silva", "Janja"], ["Geraldo Alckmin", "Alckmin"], ["Hamilton Mourão", "Mourão"],
         ["Dilma Rousseff", "Dilma"], ["Michel Temer", "Temer"], ["Fernando Haddad", "Haddad"], ["Paulo Guedes", "Guedes"], ["Sergio Moro", "Sérgio Moro", "Moro"], ["Fabrício Queiroz", "Queiroz"],
         ["Carlos Lupi", "Lupi"], ["Eduardo Pazuello", "Pazuello"], ["Walter Braga Netto", "Braga Netto"], ["Alexandre Ramagem", "Ramagem"], ["Damares Alves", "Damares"],
         ["Tarcísio de Freitas", "Tarcísio"], ["Abraham Weintraub", "Weintraub"], ["Alexandre de Moraes", "Moraes"], ["Cristiano Zanin", "Zanin"], ["Flávio Dino", "Dino"], ["Jorge Messias", "Messias"],
         ["Donald Trump", "Trump"], ["Alfredo Gaspar", "Gaspar"], ["Paulo Gonet", "Gonet"], ["Augusto Aras", "Aras"], ["Dias Toffoli", "Toffoli"], ["Luís Roberto Barroso", "Barroso"],
         ["Edson Fachin", "Fachin"], ["Luiz Fux", "Fux"], ["Javier Milei", "Milei"], ["Nicolás Maduro", "Maduro"], ["Partido dos Trabalhadores", "PT"], ["Partido Liberal", "PL"],
         ["Minha Casa, Minha Vida", "Minha Casa Minha Vida"], ["ProUni", "Prouni"]]
ANO = r"(?<!\d)(?:19|20)\d\d(?!\d)"
CANON = {nome.lower(): grupo[0] for grupo in MESMA for nome in grupo}
APELIDOS = [(r"\b(petistas?)\b", "pessoa"), (r"\b(bolsonaristas?|lulistas?)\b", "pessoa"), (r"\b(primeiro|segundo|terceiro) mandato\b", "mandato")]


def rascunhos(filtro):
    return [p for p in sorted((RAIZ / "rascunhos").glob("*.json")) if filtro(json.loads(p.read_text(encoding="utf-8")))]


def vendar(texto, troca, sorteio):
    def rotulo(tipo, original):
        nome = CANON.get(original.lower(), original)
        if nome not in troca:
            troca[nome] = f"{tipo} {next(sorteio)}"
        return troca[nome]

    for nome in sorted(PESSOAS, key=len, reverse=True):
        texto = re.sub(r"(?<![\w-])" + re.escape(nome) + r"(?![\w-])", lambda m: rotulo("Pessoa", m.group(0)), texto)
    for nome in sorted(PARTIDOS, key=len, reverse=True):
        texto = re.sub(r"(?<![\w-])" + re.escape(nome) + r"(?![\w-])", lambda m: rotulo("Partido", m.group(0)), texto)
    for nome in sorted(PROGRAMAS, key=len, reverse=True):
        texto = re.sub(r"(?<![\w-])" + re.escape(nome) + r"(?![\w-])", lambda m: rotulo("Programa", m.group(0)), texto, flags=re.I)
    for padrao, tipo in APELIDOS:
        texto = re.sub(padrao, lambda m: rotulo("Grupo" if tipo == "pessoa" else "Mandato", m.group(0).lower()), texto, flags=re.I)
    return re.sub(ANO, lambda m: troca[m.group(0)], texto)


def sorteador():
    letras = list(string.ascii_uppercase)
    random.shuffle(letras)
    return iter(letras + [a + b for a in letras for b in letras])


def item_vendado(r):
    textos = [r[k] for k in ("nome", "definicao", "titulo", "frase") if k in r] + [t["trecho"] for t in [r.get("ancora", {})] + r.get("fontes", []) if t.get("trecho")] + [r.get("ancora", {}).get("documento", "")]
    troca, sorteio = {ano: f"ano {chr(65 + i)}" for i, ano in enumerate(sorted(set(re.findall(ANO, " ".join(textos)))))}, sorteador()
    if "definicao" in r:
        return {"rotulo": r["rotulo"], "e": "definicao", "termo": vendar(r["nome"], troca, sorteio), "definicao": vendar(r["definicao"], troca, sorteio)}, troca
    item = {"rotulo": r["rotulo"], "e": "fato", "titulo": vendar(r["titulo"], troca, sorteio), "frase": vendar(r["frase"], troca, sorteio), "tipo_proposto": r["tipo"], "peso_proposto": r["peso"],
            "lente": r["lente"], "orgao": r["ancora"]["orgao"], "documento": vendar(r["ancora"]["documento"], troca, sorteio), "trechos": [vendar(r["ancora"]["trecho"], troca, sorteio)] + [vendar(f["trecho"], troca, sorteio) for f in r.get("fontes", []) if f.get("trecho")]}
    return item, troca


ESPELHO = [("Luiz Inácio Lula da Silva", "Jair Messias Bolsonaro"), ("Flávio Bolsonaro", "Fernando Haddad"), ("Michelle Bolsonaro", "Janja"), ("Jair Bolsonaro", "Lula"), ("Bolsonaro", "Lula"), ("Partido dos Trabalhadores", "Partido Liberal"), ("PT", "PL"), ("petista", "bolsonarista")]


def espelhar(texto):
    marcas = {}
    for i, (a, b) in enumerate(ESPELHO):
        for x, y in ((a, b), (b, a)):
            marca = f"\x00{i}{'ab'[x == b]}\x00"
            marcas[marca] = y
            texto = re.sub(r"(?<![\w-])" + re.escape(x) + r"(?![\w-])", marca, texto)
    for marca, y in marcas.items():
        texto = texto.replace(marca, y)
    return texto


def montar_lotes(o_que):
    rodada = datetime.datetime.now().strftime("%Y%m%d-%H%M")
    pasta = LOTES / rodada
    pasta.mkdir(parents=True)
    itens = []
    for p in [] if o_que == "termos" else rascunhos(lambda r: all(r.get("caixas", {}).get(k) for k in "123456") and "revisao" not in r):
        r = json.loads(p.read_text(encoding="utf-8"))
        itens.append({**r, "rotulo": "", "_arquivo": str(p.relative_to(RAIZ))})
    dicionario = json.loads((RAIZ / "dados/dicionario.json").read_text(encoding="utf-8"))
    itens += [{"id": "termo:" + k, "rotulo": "", "nome": v["nome"], "definicao": v["definicao"]} for k, v in dicionario.items() if "revisao" not in v and o_que != "fatos"]
    random.shuffle(itens)
    rotulos = random.sample(range(1000, 9999), len(itens))
    chave = {}
    for n in range(0, len(itens), 10):
        lote, espelho = [], []
        for r, rot in zip(itens[n:n + 10], rotulos[n:n + 10]):
            r["rotulo"] = f"F{rot}"
            item, troca = item_vendado(r)
            lote.append(item)
            chave[r["rotulo"]] = {"id": r["id"], "arquivo": r.get("_arquivo"), "troca": troca}
            if "definicao" not in r:
                espelho.append({"rotulo": r["rotulo"], "titulo": espelhar(r["titulo"]), "frase": espelhar(r["frase"]), "orgao": r["ancora"]["orgao"]})
        numero = n // 10 + 1
        (pasta / f"lote-{numero:02d}.json").write_text(json.dumps(lote, ensure_ascii=False, indent=1), encoding="utf-8")
        if espelho:
            (pasta / f"espelho-{numero:02d}.json").write_text(json.dumps(espelho, ensure_ascii=False, indent=1), encoding="utf-8")
    (RAIZ / "estado/vendas").mkdir(parents=True, exist_ok=True)
    (RAIZ / "estado/vendas" / f"{rodada}.json").write_text(json.dumps(chave, ensure_ascii=False, indent=1), encoding="utf-8")
    print(rodada, len(itens), "itens em", (len(itens) + 9) // 10, "lotes")


def respostas(pasta, nome):
    saida = {}
    for p in sorted(pasta.glob(f"*-{nome}.json")):
        for r in json.loads(p.read_text(encoding="utf-8")):
            saida[r["rotulo"]] = r
    return saida


def juntar(rodada, modelo):
    pasta = LOTES / rodada / ("opus" if modelo == "opus" and (LOTES / rodada / "opus").exists() else "")
    chave = json.loads((RAIZ / "estado/vendas" / f"{rodada}.json").read_text(encoding="utf-8"))
    votos = {o: respostas(pasta, o) for o in OTICAS + ["verificador", "espelho"]}
    dicionario = json.loads((RAIZ / "dados/dicionario.json").read_text(encoding="utf-8"))
    desacordo = []
    for rotulo, info in chave.items():
        oticas = {o: votos[o].get(rotulo) for o in OTICAS}
        if not all(oticas.values()):
            continue
        confere = all(v["confere"] and v["certeza"] >= 0.9 for v in oticas.values())
        tipos = {v.get("tipo") for v in oticas.values()}
        if not confere or len(tipos) > 1:
            desacordo.append(rotulo)
        revisao = {**oticas, "modelo": modelo, "rodada": rodada}
        if info["id"].startswith("termo:"):
            termo = info["id"][6:]
            dicionario[termo]["revisao"] = revisao
            dicionario[termo]["aprovado"] = confere
            continue
        caminho = RAIZ / info["arquivo"]
        r = json.loads(caminho.read_text(encoding="utf-8"))
        if not all(r.get("caixas", {}).get(k) for k in "123456"):
            continue
        verificador, espelho = votos["verificador"].get(rotulo), votos["espelho"].get(rotulo)
        neutra = oticas["neutra"]
        r["revisao"] = {**revisao, "verificador": verificador, "espelho": espelho}
        r["caixas"].update({"7": confere, "8": bool(verificador and verificador["sustenta"]), "9": bool(espelho and espelho["tipo"] == neutra["tipo"])})
        r["classificacao"] = neutra["tipo"] if len(tipos) == 1 else "polemico"
        r["peso_final"] = neutra.get("peso", r["peso"])
        caminho.write_text(json.dumps(r, ensure_ascii=False, indent=1), encoding="utf-8")
    (RAIZ / "dados/dicionario.json").write_text(json.dumps(dicionario, ensure_ascii=False, indent=1), encoding="utf-8")
    (pasta / "desacordo.json").write_text(json.dumps(desacordo, indent=1), encoding="utf-8")
    print(f"{len(chave)} itens, {len(desacordo)} em desacordo")


def lotes_desacordo(rodada):
    pasta = LOTES / rodada
    desacordo = set(json.loads((pasta / "desacordo.json").read_text(encoding="utf-8")))
    nova = pasta / "opus"
    nova.mkdir(exist_ok=True)
    for nome in ("lote", "espelho"):
        itens = [i for p in sorted(pasta.glob(f"{nome}-??.json")) for i in json.loads(p.read_text(encoding="utf-8")) if i["rotulo"] in desacordo]
        for n in range(0, len(itens), 10):
            (nova / f"{nome}-{n // 10 + 1:02d}.json").write_text(json.dumps(itens[n:n + 10], ensure_ascii=False, indent=1), encoding="utf-8")
    print(len(desacordo), "itens para o Opus em", nova.relative_to(RAIZ))


def correcao(rodada):
    pasta = LOTES / rodada
    chave = json.loads((RAIZ / "estado/vendas" / f"{rodada}.json").read_text(encoding="utf-8"))
    votos = {o: {**respostas(pasta, o), **respostas(pasta / "opus", o)} for o in OTICAS + ["verificador", "espelho"]}
    itens = []
    for rotulo, info in chave.items():
        if not info["arquivo"] or not (RAIZ / info["arquivo"]).exists():
            continue
        caixas = json.loads((RAIZ / info["arquivo"]).read_text(encoding="utf-8")).get("caixas", {})
        if len(caixas) == 9 and all(caixas.values()):
            continue
        volta = {v: k for k, v in info["troca"].items()}
        abrir = lambda t: re.sub("|".join(map(re.escape, sorted(volta, key=len, reverse=True))), lambda m: volta[m.group(0)], t) if volta else t
        motivos = [f"{o}: {abrir(x['motivo'])}" for o in OTICAS if (x := votos[o].get(rotulo)) and not (x["confere"] and x["certeza"] >= 0.9)]
        if (v := votos["verificador"].get(rotulo)) and not v["sustenta"]:
            motivos.append("verificador: " + abrir(v["motivo"]))
        if (e := votos["espelho"].get(rotulo)) and (n := votos["neutra"].get(rotulo)) and e["tipo"] != n["tipo"]:
            motivos.append(f"espelho: com Lula e Bolsonaro trocados no texto, o tipo vira {e['tipo']}, mas a neutra deu {n['tipo']}; o texto pode tratar os dois lados de jeito diferente")
        itens.append({"arquivo": info["arquivo"], "motivos": motivos})
    for n in range(0, len(itens), 25):
        (pasta / f"correcao-{n // 25 + 1:02d}.json").write_text(json.dumps(itens[n:n + 25], ensure_ascii=False, indent=1), encoding="utf-8")
    print(len(itens), "rascunhos para corrigir em", (len(itens) + 24) // 25, "arquivos")


if __name__ == "__main__":
    comando = sys.argv[1]
    if comando == "vendar":
        montar_lotes(sys.argv[2] if len(sys.argv) > 2 else "tudo")
    elif comando == "juntar":
        juntar(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "sonnet")
    elif comando == "desacordo":
        lotes_desacordo(sys.argv[2])
    elif comando == "correcao":
        correcao(sys.argv[2])
