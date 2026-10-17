# Concept — sito completo (DEMO)

Sito di Concept Fitness Studio (Casale Monferrato) ricostruito da zero con un design nuovo, **usando testi, contatti, dati legali, form e banner cookie del sito originale** https://www.conceptcasale.it (letti il 17/10/2026).

## Come aprirlo
Apri `index.html` nel browser. Per provarlo da telefono: `python -m http.server 8000` in questa cartella. Il font Sora arriva da Google Fonts.

## Pagine e file
```
index.html                      home completa (hero, metodo, valore, Wellness Tower, EMS, iscrizione, dove, FAQ, galleria, newsletter, footer)
privacy-e-cookie-policy.html    informativa privacy + cookie policy (testo integrale dell'originale /privacy-policy-concept/)
assets/js/config.js             testi del banner cookie, categorie e cookie, ID tracker, endpoint form  ← modifica qui
assets/js/consent.js            banner cookie e centro preferenze (replica CookieYes)
assets/js/main.js               menu, titoli, reveal, FAQ, form a passi, tracker dopo il consenso
assets/js/motion.js             hero che misura, percorso a scroll, numeri, simulatore, galleria, mappa, cursore, transizioni
assets/css/base.css, site.css   stile (nero + lime #E7F643, font Sora)
assets/css/motion.css           movimento e componenti avanzati
assets/img/                     foto (WebP, due misure) e loghi presi dal sito originale
```

## Novità UI/UX e animazioni (seconda versione)
- **Hero che «misura»:** linea di scansione sulla foto, griglia di punti e pannello BIA / Spirometria / Stabilometria con contatore (decorativo, dichiarato «illustrazione dimostrativa»).
- **Il percorso a tappe:** sezione che resta ferma mentre scorri e passa da Ascolto ad Analisi a Il tuo piano, con numero, foto di sfondo e barra di avanzamento. Su schermi ridotti o con «movimento ridotto» diventa una lista normale.
- **Ritmo della pagina:** numeri grandi di sezione, fascia lime con i numeri (20′, 3, 0, 1 → presi dai testi del sito), citazione a tutto schermo che si accende parola per parola, foto con effetto tendina.
- **Simulatore del check-up:** l'utente sceglie l'obiettivo (le stesse 5 voci del modulo) e vede quali analisi sarebbero al centro. Il pulsante precompila il modulo e passa al passo 2. Usa chip invece di uno slider: gli obiettivi sono scelte discrete. Gli esiti sono testi derivati dal sito, senza promesse.
- **Modulo a 3 passi** (obiettivo → orario → contatti) con avanzamento automatico, etichette che salgono e coriandoli alla conferma. I campi e i testi restano quelli originali.
- **Galleria navigabile:** frecce, contatore, barra di avanzamento, tastiera e trascinamento col mouse.
- **Mappa interattiva** di Google Maps, caricata solo su richiesta (o con il consenso «Funzionali»).
- **Barra mobile** «Chiama / Prenota il check-up» che sparisce quando il modulo è in vista.
- **Cursore personalizzato** (solo mouse), **transizione a sipario** tra home e pagina legale, **riflesso sui pulsanti**, menu con voce attiva.
- **Prestazioni:** foto convertite in WebP (da 2,6 MB a circa 1,6 MB nella versione desktop, versioni da ~50 KB per mobile). Resta un solo JPG, usato come immagine di anteprima social.
- **Corretto:** alone quadrato attorno all'anello EMS.

## Cosa è copiato dall'originale (verbatim)
| Elemento | Origine |
|---|---|
| Tutti i testi della home, nell'ordine originale | Pagina principale |
| 8 FAQ + testo introduttivo | Sezione FAQ |
| Campi, placeholder, opzioni e testi dei 2 form (iscrizione e newsletter) | Moduli Contact Form 7 |
| Contatti, orari, indirizzo dello studio | Home |
| Titolare: CONCEPT A.S.D., sede legale Piazza Castello 11, C.F. 94648460155, P.IVA 02794010062 | Informativa privacy |
| Informativa privacy e cookie policy (10 sezioni) | `/privacy-policy-concept/` |
| Banner: «Teniamo molto alla tua privacy» + Personalizza / Rifiuta tutto / Accetta tutto | CookieYes |
| Centro preferenze: testo introduttivo, 6 categorie, elenco cookie con durata e descrizione, «Salva le mie preferenze» | CookieYes |

## Cosa è nuovo
Design, animazioni, menu, struttura delle sezioni, microcopy dei pulsanti («Prenota il check-up», «Scopri di più» ecc.), dati strutturati SEO (`HealthClub`), metadati Open Graph e la descrizione della pagina (l'originale non ne ha una).

## Banner cookie: come funziona
- Replica struttura e testi del banner CookieYes. Salva la scelta nel cookie `cookieyes-consent` (1 anno).
- **Nessun tracker parte senza consenso.** `main.js` carica GA4, Google Ads e Meta Pixel solo se la categoria è accettata *e* l'ID è compilato in `config.js` (`tracking`).
- Il pulsante tondo in basso a sinistra e il link «Gestisci cookie» nel footer riaprono le preferenze, come previsto dalla loro informativa (§7.3).
- Tolto il marchio «Powered by CookieYes» (non si usa più il servizio).
- ⚠️ L'**elenco dei cookie** è quello del vecchio sito (WordPress, PixelYourSite, YouTube…). Va riallineato ai cookie realmente usati dal sito definitivo.

## Da sistemare/decidere con Concept (contenuti dell'originale lasciati identici)
1. **Stato contraddittorio:** il sito dice «Siamo pronti! – APERTI» ma le FAQ dicono «Non abbiamo ancora aperto» e parlano di «offerta di pre-lancio». Decidere un solo messaggio.
2. **«10 domande più frequenti»** ma ne sono elencate 8.
3. **Claim sanitari forti** da far verificare: «protocollo clinico infallibile», «sicurissimo», «risultati scientifici… provata», «garanzia assoluta che non sarà mai affollato», «stato infiammatorio», «Assolutamente no» sull'EMS. In pubblicità su Meta/Google possono causare rifiuti.
4. **Informativa:** cita WooCommerce, Google Maps, Instagram Widget, Brevo, Google Analytics e Meta Pixel. Se il nuovo sito non li usa, va aggiornata (e riletta da un consulente privacy).
5. **Newsletter nel form di iscrizione:** nell'originale le caselle privacy e newsletter erano **già spuntate**; qui sono vuote (il consenso deve essere un'azione attiva).
6. Due indirizzi: studio in **Piazza Castello 3**, sede legale in **Piazza Castello 11**. Le FAQ dicono «fianco al Teatro Municipale», la home «fianco al Bar San Carlo».
7. Messaggi di errore/successo dei form: sono i testi standard di Contact Form 7 in italiano, **non verificati** sul sito (non ho inviato moduli al sito reale).

## Prima di pubblicarlo davvero
- Foto e logo sono quelli del sito di Concept: servono i file originali e l'autorizzazione.
- Collegare i form a un servizio (`forms.endpoint`) e alla newsletter (Brevo, come da informativa).
- Togliere `noindex` dalle pagine, mettere `demoRibbon: false`, aggiungere `robots.txt` e `sitemap.xml` con il dominio definitivo.
- Inserire gli ID di GA4, Google Ads e Meta Pixel in `config.js`.
