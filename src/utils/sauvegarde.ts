// src/utils/sauvegarde.ts
import * as fs from 'fs';
import * as path from 'path';
import { Livre } from '../models/Livre';
import { Utilisateur } from '../models/Utilisateur';
import { Emprunt } from '../models/Emprunt';
import { StatutLivre, GenreLivre, RoleUtilisateur, StatutEmprunt } from '../enums';

// Interface pour les données sauvegardées
interface DonneesSauvegardees {
    livres: {
        id: number;
        titre: string;
        auteur: string;
        isbn: string;
        genre: string;
        anneePublication: number;
        statut: string;
        nombreEmprunts: number;
    }[];
    utilisateurs: {
        id: number;
        nom: string;
        prenom: string;
        email: string;
        telephone: string;
        dateInscription: string;
        role: string;
        actif: boolean;
        livresEmpruntes: number[];
        amende: number;
    }[];
    emprunts: {
        id: number;
        livreId: number;
        utilisateurId: number;
        dateEmprunt: string;
        dateRetourPrevue: string;
        dateRetourReel?: string;
        statut: string;
        nombreProlongations: number;
        prolonge: boolean;
    }[];
}

/**
 * Sauvegarde les données dans un fichier JSON
 */
export function sauvegarderDonnees(
    livres: Livre[],
    utilisateurs: Utilisateur[],
    emprunts: Emprunt[],
    nomFichier: string = 'data.json'
): void {
    try {
        const donnees: DonneesSauvegardees = {
            livres: livres.map(l => ({
                id: l.id,
                titre: l.titre,
                auteur: l.auteur,
                isbn: l.isbn,
                genre: l.genre,
                anneePublication: l.anneePublication,
                statut: l.statut,
                nombreEmprunts: l.nombreEmprunts
            })),
            utilisateurs: utilisateurs.map(u => ({
                id: u.id,
                nom: u.nom,
                prenom: u.prenom,
                email: u.email,
                telephone: u.telephone,
                dateInscription: u.dateInscription.toISOString(),
                role: u.role,
                actif: u.actif,
                livresEmpruntes: u.livresEmpruntes,
                amende: u.amende
            })),
            emprunts: emprunts.map(e => ({
                id: e.id,
                livreId: e.livre.id,
                utilisateurId: e.utilisateur.id,
                dateEmprunt: e.dateEmprunt.toISOString(),
                dateRetourPrevue: e.dateRetourPrevue.toISOString(),
                dateRetourReel: e.dateRetourReel?.toISOString(),
                statut: e.statut,
                nombreProlongations: e.nombreProlongations,
                prolonge: e.prolonge
            }))
        };

        const json = JSON.stringify(donnees, null, 2);
        fs.writeFileSync(nomFichier, json, 'utf8');
        console.log(`✅ Données sauvegardées dans ${nomFichier}`);
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde :', error);
    }
}

/**
 * Charge les données depuis un fichier JSON
 */
export function chargerDonnees(nomFichier: string = 'data.json'): DonneesSauvegardees | null {
    try {
        if (!fs.existsSync(nomFichier)) {
            console.log('ℹ️ Aucun fichier de sauvegarde trouvé');
            return null;
        }

        const data = fs.readFileSync(nomFichier, 'utf8');
        const donnees = JSON.parse(data) as DonneesSauvegardees;
        console.log(`✅ Données chargées depuis ${nomFichier}`);
        return donnees;
    } catch (error) {
        console.error('❌ Erreur lors du chargement :', error);
        return null;
    }
}

/**
 * Convertit les données sauvegardées en objets Livre
 */
export function restaurerLivres(donnees: DonneesSauvegardees): Livre[] {
    return donnees.livres.map(l => {
        const livre = new Livre(
            l.id,
            l.titre,
            l.auteur,
            l.isbn,
            l.genre as GenreLivre,
            l.anneePublication,
            l.statut as StatutLivre
        );
        livre.nombreEmprunts = l.nombreEmprunts;
        return livre;
    });
}

/**
 * Convertit les données sauvegardées en objets Utilisateur
 */
export function restaurerUtilisateurs(donnees: DonneesSauvegardees): Utilisateur[] {
    return donnees.utilisateurs.map(u => {
        const utilisateur = new Utilisateur(
            u.id,
            u.nom,
            u.prenom,
            u.email,
            u.telephone,
            u.role as RoleUtilisateur
        );
        utilisateur.dateInscription = new Date(u.dateInscription);
        utilisateur.actif = u.actif;
        utilisateur.livresEmpruntes = u.livresEmpruntes;
        utilisateur.amende = u.amende;
        return utilisateur;
    });
}