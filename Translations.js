/**
 * Simple in-app translation dictionary.
 * Add a new language by adding a new key here — no extra library needed
 * for a UI this size, though a real production app would likely use
 * i18next or react-i18next once the string count grows.
 */

export const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'te', label: 'TE' },
];

export const translations = {
  en: {
    appTitle: 'Barcode Scanner',
    appSubtitle: 'Food products only \u2014 powered by OpenFoodFacts',
    scanTab: 'Scan',
    historyTab: 'History',
    pointCamera: 'Point your camera at a barcode',
    permissionMessage: 'We need camera access to scan barcodes.',
    grantPermission: 'Grant permission',
    openSettings: 'Open Settings',
    scanAgain: 'Scan again',
    lookingUp: 'Looking up product...',
    productNotFound: 'No product info found for this barcode.',
    barcode: 'Barcode',
    brand: 'Brand',
    noHistory: 'No scans yet. Switch to the Scan tab to get started.',
    clearHistory: 'Clear history',
    clearHistoryConfirmTitle: 'Clear all history?',
    clearHistoryConfirmMsg: 'This removes every saved scan. This can\'t be undone.',
    cancel: 'Cancel',
    clear: 'Clear',
  },
  fr: {
    appTitle: 'Scanner de Codes-barres',
    appSubtitle: 'Produits alimentaires uniquement \u2014 données OpenFoodFacts',
    scanTab: 'Scanner',
    historyTab: 'Historique',
    pointCamera: 'Pointez votre caméra vers un code-barres',
    permissionMessage: "Nous avons besoin d'accéder à la caméra pour scanner les codes-barres.",
    grantPermission: "Autoriser l'accès",
    openSettings: 'Ouvrir les réglages',
    scanAgain: 'Scanner à nouveau',
    lookingUp: 'Recherche du produit...',
    productNotFound: 'Aucune information trouvée pour ce code-barres.',
    barcode: 'Code-barres',
    brand: 'Marque',
    noHistory: "Aucun scan pour le moment. Allez dans l'onglet Scanner pour commencer.",
    clearHistory: "Effacer l'historique",
    clearHistoryConfirmTitle: "Effacer tout l'historique ?",
    clearHistoryConfirmMsg: 'Cela supprime tous les scans enregistrés. Action irréversible.',
    cancel: 'Annuler',
    clear: 'Effacer',
  },
  te: {
    appTitle: 'బార్‌కోడ్ స్కానర్',
    appSubtitle: 'ఆహార ఉత్పత్తులు మాత్రమే \u2014 OpenFoodFacts డేటా ఆధారంగా',
    scanTab: 'స్కాన్ చేయండి',
    historyTab: 'చరిత్ర',
    pointCamera: 'బార్‌కోడ్ వైపు మీ కెమెరాను చూపించండి',
    permissionMessage: 'బార్‌కోడ్‌లను స్కాన్ చేయడానికి మాకు కెమెరా యాక్సెస్ అవసరం.',
    grantPermission: 'అనుమతి ఇవ్వండి',
    openSettings: 'సెట్టింగ్‌లను తెరవండి',
    scanAgain: 'మళ్లీ స్కాన్ చేయండి',
    lookingUp: 'ఉత్పత్తిని వెతుకుతోంది...',
    productNotFound: 'ఈ బార్‌కోడ్ కోసం ఉత్పత్తి సమాచారం కనుగొనబడలేదు.',
    barcode: 'బార్‌కోడ్',
    brand: 'బ్రాండ్',
    noHistory: 'ఇంకా స్కాన్‌లు లేవు. ప్రారంభించడానికి స్కాన్ ట్యాబ్‌కు వెళ్లండి.',
    clearHistory: 'చరిత్రను క్లియర్ చేయండి',
    clearHistoryConfirmTitle: 'మొత్తం చరిత్రను క్లియర్ చేయాలా?',
    clearHistoryConfirmMsg: 'ఇది సేవ్ చేసిన అన్ని స్కాన్‌లను తొలగిస్తుంది. దీన్ని రద్దు చేయలేరు.',
    cancel: 'రద్దు చేయండి',
    clear: 'క్లియర్ చేయండి',
  },
};

