<style>
.mermaid { background: #ffffff; padding: 12px; border-radius: 6px; }
.mermaid svg { background: #ffffff; }
</style>

# Reservation Payment — Class Diagram (Strategy)

Author: Filip Tomanka

Návrhový vzor: **Strategy**

- `PaymentService` = **Context** — orchestruje platby, drží aktuálně zvolenou strategii a implementuje veřejné rozhraní modulu `IPaymentService`.
- `IPaymentStrategy` = **Strategy** — rozhraní pro vzájemně zaměnitelné platební metody.
- `KartaStrategy`, `BankovniPrevodStrategy`, `HotovostStrategy` = **ConcreteStrategy** — konkrétní algoritmy provedení platby.
- `IPaymentService` = veřejné rozhraní modulu, přes které volá fasáda check-in/check-out (zejména `JeUhrazenaZaloha(rezId)`).

```mermaid
%%{init: {"theme": "default"}}%%
classDiagram
    class IPaymentService {
        <<interface>>
        +ZaplatZalohu(rezId, castka, strategie) PaymentResult
        +JeUhrazenaZaloha(rezId) bool
        +PridejPolozku(rezId, polozka)
        +ZaplatZaverecnouFakturu(rezId, strategie) PaymentResult
        +VratSouhrn(rezId) Souhrn
    }

    class PaymentService {
        -IPaymentStrategy strategie
        -db
        +ZaplatZalohu(rezId, castka, strategie) PaymentResult
        +JeUhrazenaZaloha(rezId) bool
        +PridejPolozku(rezId, polozka)
        +ZaplatZaverecnouFakturu(rezId, strategie) PaymentResult
        +VratSouhrn(rezId) Souhrn
        -nastavStrategii(strategie)
    }

    class IPaymentStrategy {
        <<interface>>
        +Zaplat(castka, kontext) PaymentResult
        +Nazev() PaymentMethod
    }

    class KartaStrategy {
        -platebniBrana
        +Zaplat(castka, kontext) PaymentResult
        +Nazev() PaymentMethod
    }
    class BankovniPrevodStrategy {
        +Zaplat(castka, kontext) PaymentResult
        +Nazev() PaymentMethod
    }
    class HotovostStrategy {
        +Zaplat(castka, kontext) PaymentResult
        +Nazev() PaymentMethod
    }

    class Payment {
        +int id
        +int rezId
        +int hostId
        +int castka
        +PaymentType typ
        +PaymentStatus stav
        +PaymentMethod metoda
        +datetime zaplaceno
    }

    class PaymentResult {
        +bool uspech
        +int paymentId
        +string zprava
    }

    class PaymentType {
        <<enumeration>>
        DEPOSIT
        FINAL
    }
    class PaymentStatus {
        <<enumeration>>
        PENDING
        PAID
        FAILED
    }
    class PaymentMethod {
        <<enumeration>>
        KARTA
        PREVOD
        HOTOVOST
    }

    PaymentService ..|> IPaymentService
    PaymentService o--> IPaymentStrategy : drží aktuální strategii
    IPaymentStrategy <|.. KartaStrategy
    IPaymentStrategy <|.. BankovniPrevodStrategy
    IPaymentStrategy <|.. HotovostStrategy
    PaymentService --> Payment : vytváří / spravuje
    IPaymentStrategy ..> PaymentResult : vrací
    Payment ..> PaymentType
    Payment ..> PaymentStatus
    Payment ..> PaymentMethod
```

## Integrace s ostatními moduly

```mermaid
%%{init: {"theme": "default"}}%%
flowchart LR
    subgraph CheckInOut["Check-in / Check-out (Dmytro) — Facade"]
        F[CheckInOutFacade]
    end
    subgraph Payment["Reservation Payment (Filip) — Strategy"]
        PS[PaymentService]
    end

    F -- "JeUhrazenaZaloha(rezId)" --> PS
    PS -- "true / false" --> F

    Res["Reservation service<br/>(rezervace → ZaplatZalohu)"] --> PS
    PS -. "delegace platby" .-> Strat["IPaymentStrategy<br/>(Karta / Převod / Hotovost)"]
```

Dohodnutý kontrakt mezi moduly je metoda `JeUhrazenaZaloha(rezId): bool` na rozhraní
`IPaymentService`. Check-in ji volá ve své fasádě (`_platby.JeUhrazenaZaloha(rezId)`) a podle
výsledku povolí, nebo zamítne příjezd hosta. Vše ostatní okolo platby (volba metody, záloha,
finální souhrn služeb) je interní záležitost tohoto modulu.
