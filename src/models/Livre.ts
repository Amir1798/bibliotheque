// src/models/Livre.ts
import { StatutLivre, GenreLivre } from "../enums";

export class Livre {
    public id: number;
    public titre: string;
    public auteur: string;
    public isbn: string;
    public genre: GenreLivre;
    public anneePublication: number;
    public statut: StatutLivre;
    public nombreEmprunts: number = 0;

    constructor(
        id: number,
        titre: string,
        auteur: string,
        isbn: string,
        genre: GenreLivre,
        anneePublication: number,
        statut: StatutLivre = StatutLivre.DISPONIBLE
    ) {
        this.id = id;
        this.titre = titre;
        this.auteur = auteur;
        this.isbn = isbn;
        this.genre = genre;
        this.anneePublication = anneePublication;
        this.statut = statut;
    }

    public toString(): string {
        return `${this.titre} - ${this.auteur} (${this.anneePublication})`;
    }

    // ✅ AJOUTER CES 2 MÉTHODES
    public estDisponible(): boolean {
        return this.statut === StatutLivre.DISPONIBLE;
    }

    public estEmprunte(): boolean {
        return this.statut === StatutLivre.EMPRUNTE;
    }
}