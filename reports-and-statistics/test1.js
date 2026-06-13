class PrehledObsazenosti {
    constructor(datumOd, datumDo, hotelId) {
        this.datumOd = datumOd
        this.datumDo = datumDo
        this.hotelId = hotelId
    }

    vytvorReport() {
        // .............
    }
}

class PrehledHostu {
    constructor(datumOd, datumDo, hotelId) {
        this.datumOd = datumOd  
        this.datumDo = datumDo  // atd....
        this.hotelId = hotelId  // atd.......
    }

    vytvorReport() {
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
        // vrátí tržby
    }
}

