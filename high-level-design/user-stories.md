# Use-cases pro hosty

## Vytvoření rezervace

- host vytvoří rezervaci
- rezervace se vztahuje k jednomu či více pokojů
- podporované zdroje:
  - vlastní web app
  - booking
  - airbnb
- systém vytvoří uživatelský účet, pokud ještě neexistuje
- odeslání notifikace o vytvoření rezervace

## Platba rezervace

- host uhradí platbu za rezervaci
- podporované platební systémy:
  - kartou (ihned)
  - převodem na účet (asynchronní kontrola, zda platba proběhla)
- po přijetí platby systém povolí check in do rezervovaných pokojů
- odeslání notifikace o možnosti check-in

## Check-in

- host provede check-in v online systému nebo na recepci
- systém zaeviduje kontaktní údaje všech osob obývající všechny pokoje
- systém vydá přístupové údaje

## Check-out

- host provede check-out na recepci
- pokoj je předán úklidové službě
- po úklidu je pokoj zpřístupněn novým rezervacím
- hostu je poslán dotazník spokojenosti

## Uživatelský profil

- zaregistrovaný host může otevřít svůj profil
- má přístup k historickým i budoucím rezervacím
- může upravit své kontaktní údaje
- může zaplatit rezervace čekající na zaplacení
- může provést check-in zaplacených rezervací

# Use-cases pro zaměstnance

## Reporty a statistiky

- přehled obsazenosti pokojů
- statistiky o hostech
- měsíční výkazy tržeb

## Správa pokojů

- přidání editace, mazání pokojů (číslo, typ, popis, kapacita)
- správa stavu pokoje (volný, obsazený, v úklidu)

## Správa hostů

- editace kontaktních údajů

## Správa rezervací

- vytvoření rezervace
- check-in, check-out
