// src/enums/index.ts

export enum StatutLivre {
    DISPONIBLE = "disponible",
    EMPRUNTE = "emprunte",
    PERDU = "perdu",
    EN_REPARATION = "en_reparation"
}

export enum RoleUtilisateur {
    MEMBRE = "membre",
    BIBLIOTHECAIRE = "bibliothecaire",
    ADMIN = "admin"
}

export enum GenreLivre {
    ROMAN = "roman",
    SCIENCE_FICTION = "science_fiction",
    FANTASY = "fantasy",
    BIOGRAPHIE = "biographie",
    HISTOIRE = "histoire",
    SCIENCE = "science",
    PHILOSOPHIE = "philosophie",
    POESIE = "poesie",
    THEATRE = "theatre"
}

// ✅ AJOUTER CET ENUM
export enum StatutEmprunt {
    EN_COURS = "en_cours",
    RENDU = "rendu",
    EN_RETARD = "en_retard"
}