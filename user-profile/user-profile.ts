// ===== Benefity (výčtový typ) =====
enum Benefit {
  LateCheckout = "POZDNI_CHECKOUT",
  FreeBreakfast = "SNIDANE_ZDARMA",
  RoomUpgrade = "UPGRADE_POKOJE",
  LoungeAccess = "PRISTUP_DO_LOUNGE",
}

// ===== Rozhraní stavu =====
interface LoyaltyState {
  discountRate(): number;          // sazba slevy (0–1)
  pointsMultiplier(): number;      // násobič získaných bodů
  benefits(): Benefit[];           // dostupné benefity
  name(): string;                  // název úrovně
  // stav dostane jen body a "povolení" povýšit – ne celý účet
  checkUpgrade(points: number, upgrade: (s: LoyaltyState) => void): void;
}

// ===== Kontext: drží aktuální stav a body =====
class LoyaltyAccount {
  private state: LoyaltyState;
  private points = 0;

  constructor(private readonly guestName: string) {
    this.state = new StandardState();   // výchozí úroveň
  }

  getPoints(): number {
    return this.points;
  }

  // VEŘEJNÉ je jen přidávání bodů – jediná cesta, jak se úroveň změní
  addPoints(amount: number): void {
    this.points += amount * this.state.pointsMultiplier();
    this.state.checkUpgrade(this.points, (s) => this.transitionTo(s));
  }

  // přepnutí úrovně je PRIVÁTNÍ – zvenčí nedostupné
  private transitionTo(newState: LoyaltyState): void {
    this.state = newState;
    console.log(`${this.guestName}: nová věrnostní úroveň – ${newState.name()}`);
  }

  applyDiscount(price: number): number {
    return price * (1 - this.state.discountRate());
  }

  availableBenefits(): Benefit[] {
    return [...this.state.benefits()];   // kopie, nejde přepsat zvenčí
  }
}

// ===== Konkrétní stavy =====
class StandardState implements LoyaltyState {
  discountRate(): number { return 0.0; }
  pointsMultiplier(): number { return 1; }
  benefits(): Benefit[] { return []; }
  name(): string { return "Standard"; }
  checkUpgrade(points: number, upgrade: (s: LoyaltyState) => void): void {
    if (points >= 1000) upgrade(new SilverState());
  }
}

class SilverState implements LoyaltyState {
  discountRate(): number { return 0.05; }
  pointsMultiplier(): number { return 1; }
  benefits(): Benefit[] { return [Benefit.LateCheckout]; }
  name(): string { return "Silver"; }
  checkUpgrade(points: number, upgrade: (s: LoyaltyState) => void): void {
    if (points >= 5000) upgrade(new GoldState());
  }
}

class GoldState implements LoyaltyState {
  discountRate(): number { return 0.10; }
  pointsMultiplier(): number { return 2; }
  benefits(): Benefit[] {
    return [Benefit.LateCheckout, Benefit.FreeBreakfast, Benefit.RoomUpgrade];
  }
  name(): string { return "Gold"; }
  checkUpgrade(points: number, upgrade: (s: LoyaltyState) => void): void {
    if (points >= 15000) upgrade(new PlatinumState());
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
  checkUpgrade(_points: number, _upgrade: (s: LoyaltyState) => void): void {
    /* nejvyšší úroveň – žádný další přechod */
  }
}

// ===== Použití =====
const account = new LoyaltyAccount("Jan Novák");
const roomPrice = 2000;
console.log(account.applyDiscount(roomPrice)); // 2000 (zatím Standard, 0 %)
account.addPoints(1200);                        // -> povýšení na Silver
console.log(account.applyDiscount(roomPrice)); // 1900 (sleva 5 %)
console.log(account.availableBenefits());      // [POZDNI_CHECKOUT]
// account.setState(...)  // už NEEXISTUJE – úroveň nelze podvádět zvenčí
