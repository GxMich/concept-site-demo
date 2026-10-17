/* ==========================================================
   CONCEPT — configurazione del sito (DEMO)
   Dati e testi copiati dal sito originale https://www.conceptcasale.it
   (home, informativa /privacy-policy-concept/, banner CookieYes) il 17/10/2026.
   ========================================================== */
window.CONCEPT_SITE = {
  // Fascia "DEMO" in cima: mettere false quando il cliente approva e pubblica il sito.
  demoRibbon: true,

  // Invio dei form: URL di un endpoint (backend, Make, Zapier, Brevo…) che riceve JSON via POST.
  // Se null il form SIMULA l'invio e nessun dato lascia il browser.
  forms: { endpoint: null },

  // Script di terze parti: si caricano SOLO dopo il consenso alla relativa categoria.
  // L'informativa originale cita Google Analytics (GA4), Google Ads e Meta Pixel.
  tracking: { ga4Id: null, googleAdsId: null, metaPixelId: null },

  /* ---------- Banner cookie: testi del banner CookieYes originale ---------- */
  consent: {
    title: "Teniamo molto alla tua privacy",
    text: "Utilizziamo i cookie per migliorare la tua esperienza di navigazione e analizzare il nostro traffico. Cliccando su “Accetta tutto”, acconsenti al nostro utilizzo dei cookie.",
    customize: "Personalizza",
    rejectAll: "Rifiuta tutto",
    acceptAll: "Accetta tutto",
    save: "Salva le mie preferenze",
    prefTitle: "Personalizza le preferenze",
    prefIntro: [
      "Utilizziamo i cookie per aiutarti a navigare in modo efficiente e svolgere determinate funzioni. Troverai informazioni dettagliate su tutti i cookie nella sezione dedicata al consenso qui sotto.",
      "I cookie classificati come “necessari” vengono memorizzati sul tuo browser in quanto essenziali per consentire le funzionalità di base del sito."
    ],
    prefMore: "Utilizziamo anche cookie di terze parti che ci aiutano ad analizzare come utilizzi questo sito web, memorizzare le tue preferenze e fornirti contenuti e pubblicità pertinenti. Questi cookie saranno memorizzati nel tuo browser solo previo tuo consenso. Puoi scegliere di abilitare o disabilitare alcuni o tutti questi cookie, ma la disabilitazione di alcuni di essi potrebbe influire sulla tua esperienza di navigazione.",
    showMore: "Mostra altro",
    showLess: "Mostra meno",
    alwaysActive: "Sempre attivo",
    labels: { cookie: "Cookie", duration: "Durata", description: "Descrizione" },
    noCookies: "Nessun Cookie da visualizzare",
    // Elenco e descrizioni come nel Preference Center originale (alcune in inglese, come in CookieYes).
    // NB: va riallineato ai cookie effettivamente usati dal sito definitivo.
    categories: [
      {
        id: "necessary", name: "Necessari", locked: true,
        desc: "I cookie necessari sono richiesti per abilitare le funzionalità di base di questo sito, come fornire un accesso sicuro o modificare le preferenze di consenso. Questi cookie non memorizzano alcun dato personale identificabile.",
        cookies: [
          ["wpEmojiSettingsSupports", "session", "WordPress imposta questo cookie quando un utente interagisce con le emoji su un sito WordPress. Aiuta a determinare se il browser dell'utente è in grado di visualizzare correttamente le emoji."],
          ["cookieyes-consent", "1 year", "CookieYes imposta questo cookie per ricordare le preferenze di consenso degli utenti, in modo che tali preferenze vengano rispettate nelle successive visite al sito. Non raccoglie né memorizza alcuna informazione personale sui visitatori del sito."],
          ["PHPSESSID", "session", "This cookie is native to PHP applications. The cookie stores and identifies a user's unique session ID to manage user sessions on the website. The cookie is a session cookie and will be deleted when all the browser windows are closed."],
          ["VISITOR_PRIVACY_METADATA", "6 months", "YouTube sets this cookie to store the user's cookie consent state for the current domain."]
        ]
      },
      {
        id: "functional", name: "Funzionali",
        desc: "I cookie funzionali aiutano a svolgere determinate funzioni, come condividere i contenuti del sito web sulle piattaforme dei social media, raccogliere feedback e altre funzionalità di terze parti.",
        cookies: [
          ["VISITOR_INFO1_LIVE", "6 months", "A cookie set by YouTube to measure bandwidth that determines whether the user gets the new or old player interface."]
        ]
      },
      {
        id: "analytics", name: "Analitici",
        desc: "I cookie analitici vengono utilizzati per comprendere come i visitatori interagiscono con il sito web. Questi cookie aiutano a fornire informazioni su metriche quali il numero di visitatori, la frequenza di rimbalzo, la fonte del traffico, ecc.",
        cookies: [
          ["pys_session_limit", "1 hour", "PixelYourSite plugin sets this cookie to manage the analytical services."],
          ["pys_start_session", "session", "PixelYourSite plugin sets this cookie to manage the analytical services."],
          ["pys_first_visit", "7 days", "PixelYourSite plugin sets this cookie to manage the analytical services."],
          ["pysTrafficSource", "7 days", "PixelYourSite plugin sets this cookie to manage the analytical services."],
          ["pys_landing_page", "7 days", "PixelYourSite plugin sets this cookie to manages the analytical services."],
          ["YSC", "session", "YSC cookie is set by Youtube and is used to track the views of embedded videos on Youtube pages."]
        ]
      },
      {
        id: "performance", name: "Performance",
        desc: "I cookie performance vengono utilizzati per comprendere e analizzare gli indici di prestazione chiave del sito web, contribuendo a offrire una migliore esperienza utente ai visitatori.",
        cookies: []
      },
      {
        id: "advertisement", name: "Pubblicitari",
        desc: "I cookie pubblicitari vengono utilizzati per fornire ai visitatori annunci pubblicitari personalizzati in base alle pagine visitate in precedenza e per analizzare l'efficacia delle campagne pubblicitarie.",
        cookies: [
          ["_fbp", "7 days", "Facebook sets this cookie to store and track interactions."],
          ["__Secure-YNID", "6 months", "Google cookie used to protect user security and prevent fraud, especially during the login process."],
          ["__Secure-ROLLOUT_TOKEN", "6 months", "YouTube sets this cookie to manage feature rollout and experimentation. It helps Google control which new features or interface changes are shown to users as part of testing and staged rollouts, ensuring consistent experience for a given user during an experiment."]
        ]
      },
      {
        id: "other", name: "Uncategorised",
        desc: "Other uncategorised cookies are those that are being analysed and have not been classified into a category as yet.",
        cookies: [
          ["pys_consent", "1 year", "Description is currently not available."],
          ["__Secure-YEC", "past", "YouTube sets this cookie to stores the user's video player preferences using embedded YouTube video"]
        ]
      }
    ]
  }
};
