# Reports and statistics
Author: Nikola Davidova

## Návrhový vzor: Template Method

## Pseudokód

```
abstract class ZakladReport {
    datumOd: datum
    datumDo: datum
    hotelId: int  // pro který hotel chceme report

    VytvorReport():         //key 
        data = NactiData()
        return ZpracujAVratVysledek(data)

    abstract NactiData()
    abstract ZpracujAVratVysledek(data)
}

class PrehledObsazenosti extends ZakladReport {
    NactiData():
        // vytáhne pokoje a jejich rezervace za období a hotel
    ZpracujAVratVysledek(data):
        // spočítá obsazenost, vrátí v procentech
}

class PrehledHostu extends ZakladReport {
    NactiData():
        // vytáhne hosty a počet jejich rezervací za období a hotel
    ZpracujAVratVysledek(data):
        // seřadí hosty a vrátí ty nejčastější
}

class MesicniTrzby extends ZakladReport {
    NactiData():
        // sečte platby za rezervace za období a hotel
    ZpracujAVratVysledek(data):
        // vrátí celkové tržby za období
}
```

## JavaScript muj test implementace 

```javascript
class ZakladReport {
    constructor(datumOd, datumDo, hotelId) {
        this.datumOd = datumOd
        this.datumDo = datumDo
        this.hotelId = hotelId
    }

    vytvorReport() {
        const data = this.nactiData()
        return this.zpracujAVratVysledek(data)
    }

    nactiData() {
        throw new Error("nactiData() musi byt implementovana")
    }

    zpracujAVratVysledek(data) {
        throw new Error("zpracujAVratVysledek() musi byt implementovana")
    }
}

class MesicniTrzby extends ZakladReport {
    nactiData() {
        // SELECT SUM(reservations.final_price) as trzby
        // FROM reservations
        // WHERE hotel_rooms.hotel = this.hotelId
        // AND reservations.valid_from BETWEEN this.datumOd AND this.datumDo
    }

    zpracujAVratVysledek(data) {
        // vrátí celkové tržby za období
    }
}

const report = new MesicniTrzby("2025-01-01", "2025-01-31", 1)
report.vytvorReport()
```


