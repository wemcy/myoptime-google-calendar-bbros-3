# OpTime Google Naptár gomb

Tampermonkey userscript, amely Google Naptár gombot ad az OpTime órarend és jelentkezések oldalain az órákhoz.

## Funkciók

- Az óra nevét, dátumát és időpontját előre kitölti a Google Naptár eseményben.
- A terem címét a helyszín mezőbe teszi: **B Bros 3-as terem, Budapest, Szegedi út 48, 1135**.
- Az OpTime kártyán látható adatokat – például az edző nevét – az esemény leírásába teszi.
- Már elkezdődött vagy „elmarad” / „elmaradt” jelzésű órákhoz nem jelenít meg gombot.
- Az órarend és a jelentkezések oldalain működik a `secure.myoptime.eu/fit/` útvonal alatt.

A gomb a Google Naptár eseménykészítő oldalát nyitja meg. Az eseményt ott még el kell menteni.

## Telepítés

1. Telepítsd a [Tampermonkey böngészőbővítményt](https://www.tampermonkey.net/).
2. Nyisd meg a Tampermonkey irányítópultját, és válaszd az **Új script létrehozása** lehetőséget.
3. Másold be az `optime-google-calendar.user.js` teljes tartalmát.
4. Mentsd el a scriptet, majd frissítsd az OpTime oldalát.

## Használat

Jelentkezz be az OpTime oldalára, majd nyisd meg az **Órarend** vagy a **Jelentkezéseim** fület. A megfelelő jövőbeli órák mellett megjelenő **＋ Naptár** gombbal nyithatod meg az előre kitöltött eseményt.

## Adatvédelem

A userscript az OpTime oldalon látható órainformációkat olvassa a böngészőben, és ezekből Google Naptár hivatkozást készít. Nem olvassa vagy továbbítja a belépési adatokat. A gomb megnyitásakor az esemény adatai a Google Naptár oldalára kerülnek.

## Licenc

[MIT License](LICENSE).

Ez egy közösségi userscript; nem áll kapcsolatban az OpTime-mal vagy a Google-lel.
