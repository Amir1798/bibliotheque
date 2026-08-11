// src/api.ts
import express from 'express';
import path from 'path';
import cors from 'cors';  // ← AJOUTER CORS
import { BibliothequeService } from './services/BibliothequeService';
import { GenreLivre, RoleUtilisateur } from './enums';

const app = express();
const port = process.env.PORT || 3000;  // ← CHANGER : Utiliser process.env.PORT

// ===== MIDDLEWARE =====
app.use(cors());  // ← AJOUTER CORS
app.use(express.json());

// ===== ROUTES FRONTEND =====

// Route pour la page d'accueil
// ⚠️ CORRECTION : 'frontend' au lieu de 'front'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/index.html'));
});

// Fichiers statiques (CSS, JS, images)
// ⚠️ CORRECTION : 'frontend' au lieu de 'front'
app.use(express.static(path.join(__dirname, '../front')));

// ===== SERVICE =====
const bibliotheque = BibliothequeService.getInstance();

// ===== ROUTES API =====

// GET - Tous les livres
app.get('/api/livres', (req, res) => {
    try {
        const livres = bibliotheque.getAllLivres();
        res.json(livres);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des livres' });
    }
});

// GET - Livres disponibles
app.get('/api/livres/disponibles', (req, res) => {
    try {
        const livres = bibliotheque.getLivresDisponibles();
        res.json(livres);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des livres disponibles' });
    }
});

// GET - Tous les utilisateurs
app.get('/api/utilisateurs', (req, res) => {
    try {
        const utilisateurs = bibliotheque.getAllUtilisateurs();
        res.json(utilisateurs);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
});

// POST - Ajouter un livre
app.post('/api/livres', (req, res) => {
    try {
        const { titre, auteur, isbn, genre, anneePublication } = req.body;
        
        if (!titre || !auteur || !isbn || !genre || !anneePublication) {
            return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
        }

        const livre = bibliotheque.ajouterLivre(titre, auteur, isbn, genre, anneePublication);
        return res.status(201).json(livre);
    } catch (error) {
        return res.status(500).json({ error: 'Erreur lors de l\'ajout du livre' });
    }
});

// POST - Ajouter un utilisateur
app.post('/api/utilisateurs', (req, res) => {
    try {
        const { nom, prenom, email, telephone, role } = req.body;
        
        if (!nom || !prenom || !email || !telephone) {
            return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
        }

        const utilisateur = bibliotheque.ajouterUtilisateur(
            nom, 
            prenom, 
            email, 
            telephone, 
            role || RoleUtilisateur.MEMBRE
        );
        return res.status(201).json(utilisateur);
    } catch (error) {
        return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'utilisateur' });
    }
});

// POST - Emprunter un livre
app.post('/api/emprunts', (req, res) => {
    try {
        const { livreId, utilisateurId } = req.body;
        
        if (!livreId || !utilisateurId) {
            return res.status(400).json({ error: 'Livre ID et Utilisateur ID sont obligatoires' });
        }

        const resultat = bibliotheque.emprunterLivre(
            parseInt(livreId), 
            parseInt(utilisateurId)
        );
        
        return res.json({ message: resultat });
    } catch (error) {
        return res.status(500).json({ error: 'Erreur lors de l\'emprunt' });
    }
});

// POST - Retourner un livre
app.post('/api/retours', (req, res) => {
    try {
        const { livreId, utilisateurId } = req.body;
        
        if (!livreId || !utilisateurId) {
            return res.status(400).json({ error: 'Livre ID et Utilisateur ID sont obligatoires' });
        }

        const resultat = bibliotheque.retournerLivre(
            parseInt(livreId), 
            parseInt(utilisateurId)
        );
        
        return res.json({ message: resultat });
    } catch (error) {
        return res.status(500).json({ error: 'Erreur lors du retour' });
    }
});

// GET - Statistiques
app.get('/api/statistiques', (req, res) => {
    try {
        const livres = bibliotheque.getAllLivres();
        const disponibles = livres.filter(l => l.statut === 'disponible');
        const empruntes = livres.filter(l => l.statut === 'emprunte');
        const utilisateurs = bibliotheque.getAllUtilisateurs();
        
        res.json({
            totalLivres: livres.length,
            livresDisponibles: disponibles.length,
            livresEmpruntes: empruntes.length,
            totalUtilisateurs: utilisateurs.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
});

// GET - Genres disponibles
app.get('/api/genres', (req, res) => {
    try {
        const genres = Object.values(GenreLivre);
        res.json(genres);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des genres' });
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`🚀 API démarrée sur http://localhost:${port}`);
    console.log(`📚 Frontend disponible sur http://localhost:${port}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
});

console.log('📚 Bibliothèque API prête !');