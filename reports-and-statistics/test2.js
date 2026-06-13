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

// PREHLED OBSAZENOSTI
class PrehledObsazenosti extends ZakladReport {
    nactiData() {
        // SELECT hotel_rooms.*, reservations.*
        // FROM hotel_rooms
        // WHERE hotel_rooms.hotel = this.hotelId
        // AND reservations.valid_from BETWEEN this.datumOd AND this.datumDo
    }

    zpracujAVratVysledek(data) {
        // spočítá kolik pokojů bylo obsazených
        // vrátí % obsazenosti
    }
}

// PREHLED HOSTŮ
class PrehledHostu extends ZakladReport {
    nactiData() {
        ///////
    }

    zpracujAVratVysledek(data) {
        // vrátí top hosty a hodnocení
    }
}

// MĚSÍČNÍ TRŽBY
class MesicniTrzby extends ZakladReport {
    nactiData() {
        //
    }

    zpracujAVratVysledek(data) {
        // vrátí celkové tržby za období
    }
}
