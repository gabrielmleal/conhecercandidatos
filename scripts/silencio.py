import datetime
import sys

BRT = datetime.timezone(datetime.timedelta(hours=-3))
agora = datetime.datetime.now(BRT)
if datetime.datetime(2026, 10, 22, 17, tzinfo=BRT) <= agora < datetime.datetime(2026, 10, 26, 17, tzinfo=BRT):
    sys.exit("silêncio do TSE até 26/out 17h: só retirada de fato com erro, à mão")
