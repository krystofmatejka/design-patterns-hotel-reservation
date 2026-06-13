class ReservationProcess {

    creteReservation(data) {
        this.checkOccupancy(data.roomId, data.date);
        this.saveGuestData(data.guest);
        this.makePayment(data.amount);
        this.sendNotification();
    }

    checkOccupancy(roomId, date) {
        /* SQL dotaz */
    }

    saveGuestData(guest){
        /* SQL dotaz */
    }

    makePayment(amount) {
        throw new Error("Payment error");
    }
    sendNotification() {
        throw new Error("Notification error");
    }
}

class StandardHotelRezervace extends ReservationProcess {
    makePayment(amount) {
        console.log(`Zpracování platební karty v hodnotě ${amount} CZK.`);
    }

    sendNotification() {
        console.log("Odesílání potvrzovacího e-mailu.");
    }
}