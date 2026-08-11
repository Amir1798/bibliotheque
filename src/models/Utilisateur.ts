// src/models/Utilisateur.ts
import { RoleUtilisateur } from "../enums";

/**
 * Classe Utilisateur - Représente un membre de la bibliothèque
 */
export class Utilisateur {
    public id: number;
    public nom: string;
    public prenom: string;
    public email: string;
    public telephone: string;
    public dateInscription: Date;
    public role: RoleUtilisateur;
    public actif: boolean;
    public livresEmpruntes: number[] = [];
    public amende: number = 0;

    /**
     * Getter : Nom complet
     */
    public get nomComplet(): string {
        return `${this.prenom} ${this.nom}`;
    }

    /**
     * Getter : Vérifie si l'utilisateur a des amendes
     */
    public get aDesAmendes(): boolean {
        return this.amende > 0;
    }

    /**
     * Constructeur
     */
    constructor(
        id: number,
        nom: string,
        prenom: string,
        email: string,
        telephone: string,
        role: RoleUtilisateur = RoleUtilisateur.MEMBRE
    ) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.role = role;
        this.dateInscription = new Date();
        this.actif = true;
    }

    /**
     * Ajoute un livre à la liste des emprunts
     */
    public ajouterEmprunt(livreId: number): void {
        if (!this.livresEmpruntes.includes(livreId)) {
            this.livresEmpruntes.push(livreId);
        }
    }

    /**
     * Retire un livre de la liste des emprunts
     */
    public retirerEmprunt(livreId: number): void {
        this.livresEmpruntes = this.livresEmpruntes.filter(id => id !== livreId);
    }

    /**
     * Ajoute une amende
     */
    public ajouterAmende(montant: number): void {
        if (montant < 0) {
            throw new Error("Le montant de l'amende ne peut pas être négatif");
        }
        this.amende += montant;
    }

    /**
     * Paye une amende
     */
    public payerAmende(montant: number): void {
        if (montant < 0) {
            throw new Error("Le montant du paiement ne peut pas être négatif");
        }
        if (montant > this.amende) {
            throw new Error("Le montant du paiement dépasse le montant de l'amende");
        }
        this.amende -= montant;
    }

    /**
     * Représentation textuelle
     */
    public toString(): string {
        return `${this.nomComplet} (${this.email}) - ${this.role}`;
    }
}