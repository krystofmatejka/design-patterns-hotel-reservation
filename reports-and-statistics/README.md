# Reports and statistics
Author: Nikola Davidova

## Návrhový vzor: Template Method

## Pseudokód

```
abstract class ZakladReport {
    datumOd: datum
    datumDo: datum
    hotelId: int  // pro který hotel chceme report

    VytvorReport():
        data = NactiData()
        return ZpracujAVratVysledek(data)

    abstract NactiData()
    abstract ZpracujAVratVysledek(data)
}

class PrehledObsazenosti extends ZakladReport {
    NactiData():
        // SELECT hotel_rooms.*, reservations.*
        // FROM hotel_rooms
        // LEFT JOIN reservations_rooms ON hotel_rooms.id = reservations_rooms.hotel_room
        // LEFT JOIN reservations ON reservations.id = reservations_rooms.reservations
        // WHERE hotel_rooms.hotel = hotelId
        // AND reservations.valid_from BETWEEN datumOd AND datumDo

    ZpracujAVratVysledek(data):
        // spočítá kolik pokojů bylo obsazených
        // vrátí % obsazenosti
}

class PrehledHostu extends ZakladReport {
    NactiData():
        // SELECT hosts.*, COUNT(reservations.id) as pocetRezervaci
        // FROM hosts
        // JOIN reservations ON hosts.id = reservations.host
        // JOIN reservations_rooms ON reservations.id = reservations_rooms.reservations
        // JOIN hotel_rooms ON reservations_rooms.hotel_room = hotel_rooms.id
        // WHERE hotel_rooms.hotel = hotelId
        // AND reservations.valid_from BETWEEN datumOd AND datumDo
        // GROUP BY hosts.id
        // ORDER BY pocetRezervaci DESC

    ZpracujAVratVysledek(data):
        // vrátí top hosty a jejich hodnocení
}

class MesicniTrzby extends ZakladReport {
    NactiData():
        // SELECT SUM(reservations.final_price) as trzby
        // FROM reservations
        // JOIN payments ON reservations.id = payments.reservation
        // JOIN reservations_rooms ON reservations.id = reservations_rooms.reservations
        // JOIN hotel_rooms ON reservations_rooms.hotel_room = hotel_rooms.id
        // WHERE hotel_rooms.hotel = hotelId
        // AND reservations.valid_from BETWEEN datumOd AND datumDo

    ZpracujAVratVysledek(data):
        // vrátí celkové tržby za období
}
```

## JavaScript implementace

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


