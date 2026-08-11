// src/models/Emprunt.ts
import { Livre } from "./Livre";
import { Utilisateur } from "./Utilisateur";
import { StatutEmprunt } from "../enums";

/**
 * Classe Emprunt - Gère un emprunt de livre
 */
export class Emprunt {
    // ===== PROPRIÉTÉS =====
    public id: number;
    public livre: Livre;
    public utilisateur: Utilisateur;
    public dateEmprunt: Date;
    public dateRetourPrevue: Date;
    public dateRetourReel?: Date; // Optionnel (rempli au retour)
    public statut: StatutEmprunt;
    public nombreProlongations: number = 0;
    public prolonge: boolean = false;

    // ===== GETTERS =====
    
    /**
     * Vérifie si l'emprunt est en retard
     * Compare la date actuelle avec la date de retour prévue
     */
    public get estEnRetard(): boolean {
        if (this.statut === StatutEmprunt.RENDU) {
            return false;
        }
        return new Date() > this.dateRetourPrevue;
    }

    /**
     * Calcule le nombre de jours restants avant la date de retour
     * Retourne un nombre négatif si en retard
     */
    public get joursRestants(): number {
        if (this.statut === StatutEmprunt.RENDU) {
            return 0;
        }
        const diff = this.dateRetourPrevue.getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    /**
     * Calcule le nombre de jours de retard
     * Retourne 0 si pas en retard
     */
    public get joursRetard(): number {
        if (!this.estEnRetard) return 0;
        const diff = new Date().getTime() - this.dateRetourPrevue.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    // ===== CONSTRUCTEUR =====
    constructor(
        id: number,
        livre: Livre,
        utilisateur: Utilisateur,
        dureeJours: number = 14 // Durée d'emprunt par défaut : 14 jours
    ) {
        this.id = id;
        this.livre = livre;
        this.utilisateur = utilisateur;
        this.dateEmprunt = new Date();
        
        // Calcul de la date de retour prévue
        this.dateRetourPrevue = new Date();
        this.dateRetourPrevue.setDate(this.dateRetourPrevue.getDate() + dureeJours);
        
        this.statut = StatutEmprunt.EN_COURS;
    }

    // ===== MÉTHODES =====

    /**
     * Retourne le livre (fin de l'emprunt)
     * Calcule automatiquement les amendes si retard
     */
    public retourner(montantAmendeParJour: number = 1): number {
        this.dateRetourReel = new Date();
        this.statut = StatutEmprunt.RENDU;
        
        // Calcul de l'amende si retard
        let amende = 0;
        if (this.estEnRetard) {
            const jours = this.joursRetard;
            amende = jours * montantAmendeParJour;
            this.statut = StatutEmprunt.EN_RETARD;
        }
        
        return amende; // Retourne le montant de l'amende
    }

    /**
     * Prolonge l'emprunt de X jours
     * Maximum 2 prolongations
     */
    public prolonger(joursSupplementaires: number = 7): boolean {
        if (this.nombreProlongations >= 2) {
            throw new Error("❌ Nombre maximum de prolongations atteint (2)");
        }

        if (this.statut === StatutEmprunt.RENDU) {
            throw new Error("❌ Impossible de prolonger un emprunt déjà rendu");
        }

        this.dateRetourPrevue.setDate(
            this.dateRetourPrevue.getDate() + joursSupplementaires
        );
        this.nombreProlongations++;
        this.prolonge = true;
        
        return true;
    }

    /**
     * Vérifie si l'emprunt peut être prolongé
     */
    public peutEtreProlonge(): boolean {
        return this.nombreProlongations < 2 && 
               this.statut !== StatutEmprunt.RENDU;
    }

    /**
     * Représentation textuelle
     */
    public toString(): string {
        const statut = this.statut === StatutEmprunt.EN_RETARD ? "⚠️ EN RETARD" : this.statut;
        return `Emprunt #${this.id} - ${this.livre.titre} (${this.utilisateur.nomComplet}) - ${statut}`;
    }
}