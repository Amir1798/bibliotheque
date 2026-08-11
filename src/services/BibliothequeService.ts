// src/services/BibliothequeService.ts
import { Livre } from "../models/Livre";
import { Utilisateur } from "../models/Utilisateur";
import { Emprunt } from "../models/Emprunt";
import { StatutLivre, GenreLivre, RoleUtilisateur, StatutEmprunt } from "../enums";
import { sauvegarderDonnees, chargerDonnees, restaurerLivres, restaurerUtilisateurs } from "../utils/sauvegarde";

export class BibliothequeService {
    private static instance: BibliothequeService;
    
    private livres: Map<number, Livre> = new Map();
    private utilisateurs: Map<number, Utilisateur> = new Map();
    private emprunts: Map<number, Emprunt> = new Map();
    
    private prochainIdLivre: number = 1;
    private prochainIdUtilisateur: number = 1;
    private prochainIdEmprunt: number = 1;

    // ✅ CONSTRUCTEUR
    private constructor() {
        this.initialiserDonneesTest();
    }

    // ✅ MÉTHODE getInstance (AJOUTER CELLE-CI)
    public static getInstance(): BibliothequeService {
        if (!BibliothequeService.instance) {
            BibliothequeService.instance = new BibliothequeService();
        }
        return BibliothequeService.instance;
    }

    // ✅ MÉTHODE initialiserDonneesTest
    private initialiserDonneesTest(): void {
        console.log("📚 Initialisation des données de test...");
        
        const livre1 = new Livre(
            this.prochainIdLivre++,
            "Le Seigneur des Anneaux",
            "J.R.R. Tolkien",
            "978-0618129111",
            GenreLivre.FANTASY,
            1954
        );
        
        const livre2 = new Livre(
            this.prochainIdLivre++,
            "1984",
            "George Orwell",
            "978-0451524935",
            GenreLivre.SCIENCE_FICTION,
            1949
        );
        
        const livre3 = new Livre(
            this.prochainIdLivre++,
            "Le Petit Prince",
            "Antoine de Saint-Exupéry",
            "978-2070612758",
            GenreLivre.BIOGRAPHIE,
            1943
        );

        this.livres.set(livre1.id, livre1);
        this.livres.set(livre2.id, livre2);
        this.livres.set(livre3.id, livre3);

        const user = new Utilisateur(
            this.prochainIdUtilisateur++,
            "Dupont",
            "Jean",
            "jean.dupont@email.com",
            "0612345678",
            RoleUtilisateur.MEMBRE
        );
        this.utilisateurs.set(user.id, user);

        console.log(`✅ ${this.livres.size} livres et ${this.utilisateurs.size} utilisateur créés`);
    }

    // ✅ GETTERS (AJOUTER CES MÉTHODES)
    public getAllLivres(): Livre[] {
        return Array.from(this.livres.values());
    }

    public getAllUtilisateurs(): Utilisateur[] {
        return Array.from(this.utilisateurs.values());
    }

    public getLivreById(id: number): Livre | undefined {
        return this.livres.get(id);
    }

    public getUtilisateurById(id: number): Utilisateur | undefined {
        return this.utilisateurs.get(id);
    }

    public getLivresDisponibles(): Livre[] {
        return this.getAllLivres().filter(livre =>
            livre.statut === StatutLivre.DISPONIBLE
        );
    }

    // ✅ MÉTHODES DE GESTION
    public ajouterLivre(
        titre: string,
        auteur: string,
        isbn: string,
        genre: GenreLivre,
        anneePublication: number
    ): Livre {
        const id = this.prochainIdLivre++;
        const livre = new Livre(id, titre, auteur, isbn, genre, anneePublication);
        this.livres.set(id, livre);
        console.log(`✅ Livre ajouté : "${titre}"`);
        return livre;
    }

    public ajouterUtilisateur(
        nom: string,
        prenom: string,
        email: string,
        telephone: string,
        role: RoleUtilisateur = RoleUtilisateur.MEMBRE
    ): Utilisateur {
        const id = this.prochainIdUtilisateur++;
        const utilisateur = new Utilisateur(id, nom, prenom, email, telephone, role);
        this.utilisateurs.set(id, utilisateur);
        console.log(`✅ Utilisateur ajouté : ${utilisateur.nomComplet}`);
        return utilisateur;
    }

    // ✅ EMPRUNTS (AJOUTER CES MÉTHODES)
    public emprunterLivre(livreId: number, utilisateurId: number): string {
        const livre = this.getLivreById(livreId);
        if (!livre) return "❌ Livre non trouvé";

        const utilisateur = this.getUtilisateurById(utilisateurId);
        if (!utilisateur) return "❌ Utilisateur non trouvé";

        if (!utilisateur.actif) return "❌ Utilisateur inactif";
        if (utilisateur.aDesAmendes) {
            return `❌ L'utilisateur a des amendes impayées (${utilisateur.amende}€)`;
        }
        if (livre.statut !== StatutLivre.DISPONIBLE) {
            return "❌ Le livre n'est pas disponible";
        }

        livre.statut = StatutLivre.EMPRUNTE;
        livre.nombreEmprunts++;
        utilisateur.ajouterEmprunt(livreId);

        return `✅ "${livre.titre}" emprunté par ${utilisateur.nomComplet}`;
    }

    public retournerLivre(livreId: number, utilisateurId: number): string {
        const livre = this.getLivreById(livreId);
        if (!livre) return "❌ Livre non trouvé";

        const utilisateur = this.getUtilisateurById(utilisateurId);
        if (!utilisateur) return "❌ Utilisateur non trouvé";

        if (livre.statut !== StatutLivre.EMPRUNTE) {
            return "❌ Ce livre n'est pas emprunté";
        }

        livre.statut = StatutLivre.DISPONIBLE;
        utilisateur.retirerEmprunt(livreId);

        return `✅ "${livre.titre}" retourné par ${utilisateur.nomComplet}`;
    }

    // ✅ GETTERS POUR EMPRUNTS
    public getEmpruntsActifs(): Emprunt[] {
        return Array.from(this.emprunts.values()).filter(e => 
            e.statut === StatutEmprunt.EN_COURS
        );
    }

    public getAllEmprunts(): Emprunt[] {
        return Array.from(this.emprunts.values());
    }

    // ✅ SAUVEGARDE
    public sauvegarder(): void {
        sauvegarderDonnees(
            this.getAllLivres(),
            this.getAllUtilisateurs(),
            this.getAllEmprunts()
        );
    }

    public chargerSauvegarde(): void {
        const donnees = chargerDonnees();
        if (!donnees) {
            this.initialiserDonneesTest();
            return;
        }
        console.log("✅ Données chargées avec succès !");
    }

    public prolongerEmprunt(empruntId: number, jours: number = 7): string {
        const emprunt = this.emprunts.get(empruntId);
        if (!emprunt) return "❌ Emprunt non trouvé";
        try {
            emprunt.prolonger(jours);
            return `✅ Emprunt prolongé de ${jours} jours. Nouvelle date : ${emprunt.dateRetourPrevue.toLocaleDateString()}`;
        } catch (error) {
            return error instanceof Error ? error.message : "❌ Erreur inconnue";
        }
    }

    // ✅ RAPPORT
    public afficherRapport(): void {
        console.log("\n" + "=".repeat(60));
        console.log("📊 RAPPORT DE LA BIBLIOTHÈQUE");
        console.log("=".repeat(60));

        const livres = this.getAllLivres();
        const disponibles = livres.filter(l => l.statut === StatutLivre.DISPONIBLE);
        const empruntes = livres.filter(l => l.statut === StatutLivre.EMPRUNTE);
        const utilisateurs = this.getAllUtilisateurs();

        console.log(`📚 Total livres : ${livres.length}`);
        console.log(`✅ Disponibles : ${disponibles.length}`);
        console.log(`❌ Empruntés : ${empruntes.length}`);
        console.log(`👥 Utilisateurs : ${utilisateurs.length}`);

        console.log("\n📕 LISTE DES LIVRES :");
        livres.forEach(l => {
            const status = l.statut === StatutLivre.DISPONIBLE ? "✅" : "❌";
            console.log(`  ${status} ${l.toString()} [${l.nombreEmprunts} emprunts]`);
        });

        console.log("\n👤 UTILISATEURS :");
        utilisateurs.forEach(u => {
            const actif = u.actif ? "✅" : "❌";
            console.log(`  ${actif} ${u.nomComplet} - ${u.role} (${u.livresEmpruntes.length} livres)`);
            if (u.aDesAmendes) {
                console.log(`    💶 Amende : ${u.amende}€`);
            }
        });

        console.log("=".repeat(60) + "\n");
    }
}