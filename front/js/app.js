// frontend/js/app.js

// ===== CONFIGURATION =====
// Détection automatique de l'URL de l'API
// En local : http://localhost:3000/api
// En production : https://bibliotheque-production-6cd3.up.railway.app/api
const API_URL = window.location.origin + '/api';

// Pour debug - Affiche l'URL dans la console
console.log('📡 API_URL:', API_URL);

// ===== ÉTAT DE L'APPLICATION =====
let livres = [];
let utilisateurs = [];

// ===== FONCTIONS UTILITAIRES =====

/**
 * Formate une date
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Affiche un statut avec la bonne couleur
 */
function statusHTML(statut) {
    const classes = {
        'disponible': 'disponible',
        'emprunte': 'emprunte',
        'perdu': 'perdu',
        'en_reparation': 'perdu'
    };
    return `<span class="status ${classes[statut] || ''}">${statut}</span>`;
}

// ===== NAVIGATION =====

/**
 * Gère le changement de vue
 */
document.querySelectorAll('nav button').forEach(button => {
    button.addEventListener('click', () => {
        // Désactiver tous les boutons
        document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
        button.classList.add('active');

        // Cacher toutes les vues
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

        // Afficher la vue correspondante
        const viewId = button.dataset.view;
        const view = document.getElementById(`view-${viewId}`);
        if (view) view.classList.add('active');

        // Charger les données si besoin
        if (viewId === 'livres') chargerLivres();
        if (viewId === 'utilisateurs') chargerUtilisateurs();
    });
});

// ===== CHARGEMENT DES DONNÉES =====

/**
 * Charge les statistiques
 */
async function chargerStatistiques() {
    try {
        const response = await fetch(`${API_URL}/statistiques`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stats = await response.json();
        
        document.getElementById('totalLivres').textContent = stats.totalLivres || 0;
        document.getElementById('livresDisponibles').textContent = stats.livresDisponibles || 0;
        document.getElementById('livresEmpruntes').textContent = stats.livresEmpruntes || 0;
        document.getElementById('totalUtilisateurs').textContent = stats.totalUtilisateurs || 0;
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

/**
 * Charge les livres
 */
async function chargerLivres() {
    try {
        console.log('📡 Chargement des livres depuis:', `${API_URL}/livres`);
        const response = await fetch(`${API_URL}/livres`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        livres = await response.json();
        afficherLivres(livres);
    } catch (error) {
        console.error('Erreur lors du chargement des livres:', error);
        document.getElementById('livresList').innerHTML = `<p>❌ Erreur lors du chargement des livres</p><p style="font-size:12px;color:#666;">${error.message}</p>`;
    }
}

/**
 * Affiche les livres
 */
function afficherLivres(livres) {
    const container = document.getElementById('livresList');
    
    if (!livres || livres.length === 0) {
        container.innerHTML = '<p>📭 Aucun livre disponible</p>';
        return;
    }

    container.innerHTML = livres.map(livre => `
        <div class="card">
            <div class="title">${livre.titre}</div>
            <div class="subtitle">✍️ ${livre.auteur}</div>
            <div style="margin: 8px 0;">
                ${statusHTML(livre.statut)}
            </div>
            <div style="font-size: 13px; color: #888;">
                <span class="badge">📅 ${livre.anneePublication}</span>
                <span class="badge">📖 ${livre.genre}</span>
                <span class="badge">ID: ${livre.id}</span>
                <span class="badge">${livre.nombreEmprunts} emprunts</span>
            </div>
        </div>
    `).join('');
}

/**
 * Charge les utilisateurs
 */
async function chargerUtilisateurs() {
    try {
        console.log('📡 Chargement des utilisateurs depuis:', `${API_URL}/utilisateurs`);
        const response = await fetch(`${API_URL}/utilisateurs`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        utilisateurs = await response.json();
        afficherUtilisateurs(utilisateurs);
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        document.getElementById('utilisateursList').innerHTML = `<p>❌ Erreur lors du chargement des utilisateurs</p><p style="font-size:12px;color:#666;">${error.message}</p>`;
    }
}

/**
 * Affiche les utilisateurs
 */
function afficherUtilisateurs(utilisateurs) {
    const container = document.getElementById('utilisateursList');
    
    if (!utilisateurs || utilisateurs.length === 0) {
        container.innerHTML = '<p>👤 Aucun utilisateur</p>';
        return;
    }

    container.innerHTML = utilisateurs.map(user => `
        <div class="card">
            <div class="title">${user.prenom} ${user.nom}</div>
            <div class="subtitle">📧 ${user.email}</div>
            <div style="font-size: 13px; color: #888;">
                <span class="badge">📞 ${user.telephone}</span>
                <span class="badge">👤 ${user.role}</span>
                <span class="badge">📚 ${user.livresEmpruntes?.length || 0} livres</span>
                ${user.amende > 0 ? `<span class="badge" style="background: #f8d7da; color: #721c24;">💶 ${user.amende}€</span>` : ''}
                <span class="badge">${user.actif ? '✅ Actif' : '❌ Inactif'}</span>
            </div>
        </div>
    `).join('');
}

// ===== AJOUT DE LIVRE =====

/**
 * Charge les genres dans le select
 */
async function chargerGenres() {
    try {
        console.log('📡 Chargement des genres depuis:', `${API_URL}/genres`);
        const response = await fetch(`${API_URL}/genres`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const genres = await response.json();
        
        const select = document.getElementById('genre');
        // Vider le select avant d'ajouter
        select.innerHTML = '<option value="">-- Choisissez un genre --</option>';
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des genres:', error);
    }
}

/**
 * Gère l'ajout d'un livre
 */
document.getElementById('formAjoutLivre').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        titre: document.getElementById('titre').value,
        auteur: document.getElementById('auteur').value,
        isbn: document.getElementById('isbn').value,
        genre: document.getElementById('genre').value,
        anneePublication: parseInt(document.getElementById('annee').value)
    };

    try {
        const response = await fetch(`${API_URL}/livres`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('✅ Livre ajouté avec succès !');
            document.getElementById('formAjoutLivre').reset();
            chargerStatistiques();
            chargerLivres();
            
            // Basculer vers la vue livres
            document.querySelector('[data-view="livres"]').click();
        } else {
            const error = await response.json();
            alert(`❌ Erreur : ${error.error}`);
        }
    } catch (error) {
        alert('❌ Erreur lors de l\'ajout du livre');
        console.error(error);
    }
});

// ===== AJOUT D'UTILISATEUR =====

/**
 * Gère l'ajout d'un utilisateur
 */
document.getElementById('formAjoutUtilisateur').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        nom: document.getElementById('nom').value,
        prenom: document.getElementById('prenom').value,
        email: document.getElementById('email').value,
        telephone: document.getElementById('telephone').value,
        role: 'membre'
    };

    try {
        const response = await fetch(`${API_URL}/utilisateurs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('✅ Utilisateur ajouté avec succès !');
            document.getElementById('formAjoutUtilisateur').reset();
            chargerStatistiques();
            chargerUtilisateurs();
            
            // Basculer vers la vue utilisateurs
            document.querySelector('[data-view="utilisateurs"]').click();
        } else {
            const error = await response.json();
            alert(`❌ Erreur : ${error.error}`);
        }
    } catch (error) {
        alert('❌ Erreur lors de l\'ajout de l\'utilisateur');
        console.error(error);
    }
});

// ===== EMPRUNTS =====

/**
 * Gère l'emprunt d'un livre
 */
document.getElementById('btnEmprunter').addEventListener('click', async () => {
    const livreId = document.getElementById('empruntLivreId').value;
    const utilisateurId = document.getElementById('empruntUtilisateurId').value;

    if (!livreId || !utilisateurId) {
        afficherResultat('empruntResultat', '⚠️ Veuillez remplir tous les champs', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/emprunts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                livreId: parseInt(livreId),
                utilisateurId: parseInt(utilisateurId)
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            afficherResultat('empruntResultat', data.message, 'success');
            document.getElementById('empruntLivreId').value = '';
            document.getElementById('empruntUtilisateurId').value = '';
            chargerStatistiques();
            chargerLivres();
        } else {
            afficherResultat('empruntResultat', data.error || 'Erreur lors de l\'emprunt', 'error');
        }
    } catch (error) {
        afficherResultat('empruntResultat', '❌ Erreur de connexion', 'error');
        console.error(error);
    }
});

/**
 * Gère le retour d'un livre
 */
document.getElementById('btnRetourner').addEventListener('click', async () => {
    const livreId = document.getElementById('retourLivreId').value;
    const utilisateurId = document.getElementById('retourUtilisateurId').value;

    if (!livreId || !utilisateurId) {
        afficherResultat('retourResultat', '⚠️ Veuillez remplir tous les champs', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/retours`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                livreId: parseInt(livreId),
                utilisateurId: parseInt(utilisateurId)
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            afficherResultat('retourResultat', data.message, 'success');
            document.getElementById('retourLivreId').value = '';
            document.getElementById('retourUtilisateurId').value = '';
            chargerStatistiques();
            chargerLivres();
        } else {
            afficherResultat('retourResultat', data.error || 'Erreur lors du retour', 'error');
        }
    } catch (error) {
        afficherResultat('retourResultat', '❌ Erreur de connexion', 'error');
        console.error(error);
    }
});

/**
 * Affiche un résultat (succès ou erreur)
 */
function afficherResultat(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = type;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// ===== RECHERCHE =====

/**
 * Recherche un livre par titre
 */
document.getElementById('searchLivre').addEventListener('input', (e) => {
    const search = e.target.value.toLowerCase();
    
    if (search === '') {
        afficherLivres(livres);
        return;
    }

    const filtres = livres.filter(livre =>
        livre.titre.toLowerCase().includes(search) ||
        livre.auteur.toLowerCase().includes(search)
    );
    afficherLivres(filtres);
});

/**
 * Actualise la liste des livres
 */
document.getElementById('btnRefreshLivres').addEventListener('click', chargerLivres);

// ===== INITIALISATION =====

/**
 * Initialise l'application
 */
async function init() {
    console.log('🚀 Initialisation de la bibliothèque...');
    console.log('📡 API URL:', API_URL);
    
    try {
        await chargerGenres();
        await chargerStatistiques();
        await chargerLivres();
        await chargerUtilisateurs();
        console.log('✅ Application prête !');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
    }
}

// Lancer l'application
init();