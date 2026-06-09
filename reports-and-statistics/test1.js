class PrehledObsazenosti {
    constructor(datumOd, datumDo, hotelId) {
        this.datumOd = datumOd
        this.datumDo = datumDo
        this.hotelId = hotelId
    }

    vytvorReport() {
        // SELECT hotel_rooms.*, reservations.*
        // FROM hotel_rooms
        // WHERE hotel_rooms.hotel = this.hotelId
        // AND reservations.valid_from BETWEEN this.datumOd AND this.datumDo
        // spočítá % obsazenosti
    }
}

class PrehledHostu {
    constructor(datumOd, datumDo, hotelId) {
        this.datumOd = datumOd  
        this.datumDo = datumDo  // atd....
        this.hotelId = hotelId  // atd.......
    }

    vytvorReport() {
        // SELECT hosts.*...
        // vrátí top hosty
    }
}

class MesicniTrzby {
    constructor(datumOd, datumDo, hotelId) {
        this.datumOd = datumOd  
        this.datumDo = datumDo  // atd
        this.hotelId = hotelId  // atd..........
    }

    vytvorReport() {
        // SELECT SUM...
        // vrátí tržby
    }
}