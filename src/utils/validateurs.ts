// src/utils/validateurs.ts

/**
 * Valide un email
 * Format : texte@texte.texte
 */
export function validerEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valide un ISBN (format standard)
 * ISBN-10 ou ISBN-13
 */
export function validerISBN(isbn: string): boolean {
    // Supprime les tirets et espaces
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    
    // ISBN-10 : 10 caractères (chiffres ou X à la fin)
    if (cleanISBN.length === 10) {
        return /^\d{9}[\dX]$/.test(cleanISBN);
    }
    
    // ISBN-13 : 13 chiffres
    if (cleanISBN.length === 13) {
        return /^\d{13}$/.test(cleanISBN);
    }
    
    return false;
}

/**
 * Valide un numéro de téléphone français
 * Format : 0X XX XX XX XX ou 0XXXXXXXXX
 */
export function validerTelephone(telephone: string): boolean {
    // Enlève les espaces et tirets
    const clean = telephone.replace(/[\s-]/g, '');
    const regex = /^0[1-9]\d{8}$/;
    return regex.test(clean);
}

/**
 * Valide une année de publication
 * Entre 1450 et l'année en cours
 */
export function validerAnneePublication(annee: number): boolean {
    const anneeActuelle = new Date().getFullYear();
    return annee >= 1450 && annee <= anneeActuelle;
}

/**
 * Valide un nom (pas vide, pas de chiffres)
 */
export function validerNom(nom: string): boolean {
    return nom.trim().length > 0 && /^[a-zA-ZÀ-ÖØ-öø-ÿ\s-]+$/.test(nom);
}

/**
 * Nettoie une chaîne (trim, supprime les espaces multiples)
 */
export function nettoyerChaine(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
}

/**
 * Valide une note (entre 0 et 5)
 */
export function validerNote(note: number): boolean {
    return note >= 0 && note <= 5;
}