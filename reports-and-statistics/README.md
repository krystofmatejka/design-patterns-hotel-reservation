# Reports and statistics

Author: Nikola Davidova

## Návrhový vzor: Template Method

## Pseudokód

abstract class ZakladReport {
    datumOd: datum
    datumDo: datum

    VytvorReport():
        data = NactiData()
        return ZpracujAVratVysledek(data)

    abstract NactiData()
    abstract ZpracujAVratVysledek(data)
}

class PrehledObsazenosti extends ZakladReport {
    NactiData():
        // načte pokoje a rezervace mezi datumOd a datumDo
    ZpracujAVratVysledek(data):
        // vrátí % obsazenosti
}

class PrehledHostu extends ZakladReport {
    NactiData():
        // načte hosty a rezervace mezi datumOd a datumDo
    ZpracujAVratVysledek(data):
        // vrátí top hosty a hodnocení
}

class MesicniTrzby extends ZakladReport {
    NactiData():
        // načte platby mezi datumOd a datumDo
    ZpracujAVratVysledek(data):
        // vrátí celkové tržby za období
}