## Reservation payment - Návrhový vzor: Strategy

Platební modul řeší tři věci:

1. **Záloha při rezervaci** – host po vytvoření rezervace zaplatí zálohu. Ta se později
   ověřuje při check-inu (přes `JeUhrazenaZaloha(rezId)`, kterou volá fasáda check-in/check-out).
2. **Finální souhrn při check-outu** – ke konci pobytu se k rezervaci nasbírají položky
   (služby, nápoje, masáže, …) a vystaví se závěrečná faktura k úhradě.
3. **Více platebních metod** – kartou, bankovním převodem nebo hotově na recepci.

Hlavní problém je bod 3: stejná platba (záloha i finální souhrn) musí jít provést **různými
algoritmy** podle toho, co si host zvolí, a metody se mohou za běhu přidávat a měnit. Přesně
na to je vzor **Strategy** – definuje rodinu vzájemně zaměnitelných algoritmů (platebních
metod) za jednotným rozhraním a umožní mezi nimi přepínat v run-time bez `if/switch` v jádru
služby.

- **Context** = `PaymentService` (orchestruje platbu, drží zvolenou strategii)
- **Strategy** = `IPaymentStrategy` (rozhraní `Zaplat(castka, kontext)`)
- **ConcreteStrategy** = `KartaStrategy`, `BankovniPrevodStrategy`, `HotovostStrategy`

`PaymentService` zároveň implementuje veřejné rozhraní modulu `IPaymentService`, které je tím
jediným kontraktem vůči ostatním modulům (zejména check-in/check-out).


## Kontrakt s ostatními moduly

Jediné, na čem se modul dohodl s check-in/check-out (Dmytro), je rozhraní `IPaymentService`
a na něm metoda:

```
JeUhrazenaZaloha(rezId): bool
```

Check-in ji volá ve své fasádě (`_platby.JeUhrazenaZaloha(rezId)`) a podle výsledku povolí
nebo zamítne příjezd hosta. Zbytek platby (volba metody, samotné stržení peněz, finální
souhrn) je interní záležitost tohoto modulu.

## Pseudokód

```
enum PaymentType   { DEPOSIT, FINAL }
enum PaymentStatus { PENDING, PAID, FAILED }
enum PaymentMethod { KARTA, PREVOD, HOTOVOST }

// ---- Strategy: rozhraní platební metody ----
interface IPaymentStrategy {
  PaymentResult Zaplat(int castka, kontext);   // kontext = rezId, hostId, popis
  PaymentMethod Nazev();
}

class KartaStrategy : IPaymentStrategy {
  platebniBrana;   // externí brána (napr. Stripe/GoPay)

  Zaplat(castka, kontext) {
    vysledek = platebniBrana.charge(kontext.hostId, castka);
    if (!vysledek.ok)
      return PaymentResult(false, null, "Platba kartou zamítnuta");
    return PaymentResult(true, vysledek.transactionId, "OK");
  }
  Nazev() => PaymentMethod.KARTA;
}

class BankovniPrevodStrategy : IPaymentStrategy {
  Zaplat(castka, kontext) {
    // vygeneruje variabilní symbol, čeká na spárování -> zatím PENDING
    return PaymentResult(true, null, "Čeká na připsání převodu");
  }
  Nazev() => PaymentMethod.PREVOD;
}

class HotovostStrategy : IPaymentStrategy {
  Zaplat(castka, kontext) {
    // recepční potvrdí příjem hotovosti
    return PaymentResult(true, null, "Přijato v hotovosti");
  }
  Nazev() => PaymentMethod.HOTOVOST;
}

// ---- Context + veřejné rozhraní modulu ----
interface IPaymentService {
  PaymentResult ZaplatZalohu(int rezId, int castka, IPaymentStrategy strategie);
  bool          JeUhrazenaZaloha(int rezId);            // <-- volá check-in
  void          PridejPolozku(int rezId, polozka);      // služba, nápoj, masáž...
  PaymentResult ZaplatZaverecnouFakturu(int rezId, IPaymentStrategy strategie);
  Souhrn        VratSouhrn(int rezId);
}

class PaymentService : IPaymentService {
  db;
  IPaymentStrategy strategie;   // aktuálně zvolená metoda

  // 1) ZÁLOHA při rezervaci
  ZaplatZalohu(rezId, castka, strategie) {
    this.strategie = strategie;                         // výběr algoritmu za běhu
    rez = db.selectReservation(rezId);

    vysledek = strategie.Zaplat(castka, kontext(rez));  // delegace na Strategy

    stav = vysledek.uspech ? PaymentStatus.PAID : PaymentStatus.FAILED;
    if (strategie.Nazev() == PaymentMethod.PREVOD && vysledek.uspech)
      stav = PaymentStatus.PENDING;                     // čeká na spárování

    db.insertPayment(rezId, rez.host, castka,
                     PaymentType.DEPOSIT, stav, strategie.Nazev());
    return vysledek;
  }

  // 2) OVĚŘENÍ zálohy – tohle volá check-in
  JeUhrazenaZaloha(rezId) {
    p = db.selectPayment(rezId, PaymentType.DEPOSIT);
    return p != null && p.stav == PaymentStatus.PAID;
  }

  // 3) Položky pobytu (sbírají se během pobytu)
  PridejPolozku(rezId, polozka) {
    db.insertStayItem(rezId, polozka.popis, polozka.cena);
  }

  // 4) FINÁLNÍ souhrn při check-outu
  ZaplatZaverecnouFakturu(rezId, strategie) {
    this.strategie = strategie;
    souhrn = VratSouhrn(rezId);                         // položky + (cena - záloha)

    vysledek = strategie.Zaplat(souhrn.kCelkoveUhrade, kontext);

    stav = vysledek.uspech ? PaymentStatus.PAID : PaymentStatus.FAILED;
    db.insertPayment(rezId, souhrn.hostId, souhrn.kCelkoveUhrade,
                     PaymentType.FINAL, stav, strategie.Nazev());
    return vysledek;
  }

  VratSouhrn(rezId) {
    rez      = db.selectReservation(rezId);
    polozky  = db.selectStayItems(rezId);
    zaloha   = db.sumPaid(rezId, PaymentType.DEPOSIT);
    celkem   = rez.final_price + sum(polozky.cena);
    return Souhrn(rez.host, polozky, celkem, zaloha, celkem - zaloha);
  }
}
```

## Příklad použití

```
platby = new PaymentService(db);

// při rezervaci host platí zálohu kartou
platby.ZaplatZalohu(rezId, 2000, new KartaStrategy(brana));

// ... později při check-inu (volá modul Dmytra)
if (!platby.JeUhrazenaZaloha(rezId))
    throw "Check-in zamítnut – záloha není uhrazena";

// během pobytu
platby.PridejPolozku(rezId, { popis: "Masáž", cena: 800 });
platby.PridejPolozku(rezId, { popis: "Minibar", cena: 250 });

// při check-outu host doplatí zbytek, tentokrát hotově
platby.ZaplatZaverecnouFakturu(rezId, new HotovostStrategy());
```

> Návaznost na DB: tabulka `payments` (z high-level návrhu) se rozšiřuje o `castka`, `typ`
> (DEPOSIT/FINAL), `stav` a `metoda`, aby šlo zálohu i finální platbu evidovat a ověřovat.

## Proč Strategy (a ne switch / dědičnost)

- Platební metody přibývají a mění se nezávisle na logice zálohy/faktury → chceme je oddělit.
- Bez vzoru by `PaymentService` měla velký `switch (metoda)` v každé metodě, kde se platí
  (záloha i finální souhrn) → duplicita a špatná rozšiřitelnost.
- Strategy přesune každý algoritmus do vlastní třídy a `PaymentService` jen deleguje.

### Výhody

- Výměna platební metody za běhu (host si vybere kartu/převod/hotovost).
- Oddělení algoritmu platby od služby, která ho používá → jednoduché testování.
- Nová metoda = nová třída implementující `IPaymentStrategy`, beze změny `PaymentService`
  (Open/Closed princip).

### Nevýhody

- Více tříd (jedna na každou metodu).
- Klient/služba musí o existenci strategií vědět natolik, aby zvolila tu správnou.

### Možné alternativy

- **Factory Method / Abstract Factory** – pro samotné *vytvoření* správné strategie podle
  vstupu (lze kombinovat se Strategy – factory vyrobí strategii, kterou Context použije).
- **State** – příbuzný vzor, ale ten řeší změnu chování podle vnitřního *stavu* objektu, ne
  výběr zaměnitelného algoritmu; pro platební metody se nehodí.
- **Template Method** – kdyby kroky platby byly fixní a lišil se jen detail; my ale chceme
  vyměnit celý algoritmus, ne jen jeho část.