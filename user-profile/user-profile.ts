//  Benefity (výčtový typ) 
enum Benefit {
  LateCheckout = "POZDNI_CHECKOUT",
  FreeBreakfast = "SNIDANE_ZDARMA",
  RoomUpgrade = "UPGRADE_POKOJE",
  LoungeAccess = "PRISTUP_DO_LOUNGE",
}

//  Rozhraní stavu 
interface LoyaltyState {
  discountRate(): number;          // sazba slevy (0–1)
  pointsMultiplier(): number;      // násobič získaných bodů
  benefits(): Benefit[];           // dostupné benefity
  name(): string;                  // název úrovně
  checkUpgrade(account: LoyaltyAccount): void; // stav sám rozhodne o přechodu
}

//  Kontext: drží aktuální stav a body 
class LoyaltyAccount {
  private state: LoyaltyState;
  private points = 0;

  constructor(private readonly guestName: string) {
    this.state = new StandardState(); // výchozí úroveň
  }

  getPoints(): number {
    return this.points;
  }

  setState(newState: LoyaltyState): void {
    this.state = newState;
    console.log(`${this.guestName}: nová věrnostní úroveň – ${newState.name()}`);
  }

  addPoints(amount: number): void {
    this.points += amount * this.state.pointsMultiplier();
    this.state.checkUpgrade(this); // po přičtení zkus povýšit
  }

  applyDiscount(price: number): number {
    return price * (1 - this.state.discountRate());
  }

  availableBenefits(): Benefit[] {
    return this.state.benefits();
  }
}

//  Konkrétní stavy 
class StandardState implements LoyaltyState {
  discountRate(): number { return 0.0; }
  pointsMultiplier(): number { return 1; }
  benefits(): Benefit[] { return []; }
  name(): string { return "Standard"; }
  checkUpgrade(account: LoyaltyAccount): void {
    if (account.getPoints() >= 1000) account.setState(new SilverState());
  }
}

class SilverState implements LoyaltyState {
  discountRate(): number { return 0.05; }
  pointsMultiplier(): number { return 1; }
  benefits(): Benefit[] { return [Benefit.LateCheckout]; }
  name(): string { return "Silver"; }
  checkUpgrade(account: LoyaltyAccount): void {
    if (account.getPoints() >= 5000) account.setState(new GoldState());
  }
}

class GoldState implements LoyaltyState {
  discountRate(): number { return 0.10; }
  pointsMultiplier(): number { return 2; }
  benefits(): Benefit[] {
    return [Benefit.LateCheckout, Benefit.FreeBreakfast, Benefit.RoomUpgrade];
  }
  name(): string { return "Gold"; }
  checkUpgrade(account: LoyaltyAccount): void {
    if (account.getPoints() >= 15000) account.setState(new PlatinumState());
  }
}

class PlatinumState implements LoyaltyState {
  discountRate(): number { return 0.15; }
  pointsMultiplier(): number { return 3; }
  benefits(): Benefit[] {
    return [
      Benefit.LateCheckout,
      Benefit.FreeBreakfast,
      Benefit.RoomUpgrade,
      Benefit.LoungeAccess,
    ];
  }
  name(): string { return "Platinum"; }
  checkUpgrade(_account: LoyaltyAccount): void {
    /* nejvyšší úroveň – žádný další přechod */
  }
}

//  Použití 
const account = new LoyaltyAccount("Jan Novák");

const roomPrice = 2000;
console.log(account.applyDiscount(roomPrice)); // 2000 (zatím Standard, 0 %)

account.addPoints(1200); // -> povýšení na Silver
console.log(account.applyDiscount(roomPrice)); // 1900 (sleva 5 %)
console.log(account.availableBenefits());      // [POZDNI_CHECKOUT]