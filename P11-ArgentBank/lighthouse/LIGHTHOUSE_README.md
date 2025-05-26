<!-- @format -->

# Tests de Performance avec Lighthouse

## 📊 Approche de test

ArgentBank utilise Lighthouse pour mesurer et améliorer les performances, l'accessibilité, les bonnes pratiques et le SEO de l'application. Notre approche de test est conçue pour garantir une expérience utilisateur optimale tout en tenant compte des différences entre les environnements.

## 🗄️ Structure des rapports

Les rapports de test sont organisés comme suit :

- **reports/** : Contient les rapports actuels et récents
- **reports/archive/** : Stocke les anciens rapports pour référence historique

## 🔍 Résultats Lighthouse en production

Notre application atteint d'excellents scores en production :

### Version Mobile

- **Performance** : 94/100
- **Accessibilité** : 100/100
- **Bonnes pratiques** : 100/100
- **SEO** : 100/100

### Version Desktop

- **Performance** : 100/100
- **Accessibilité** : 100/100
- **Bonnes pratiques** : 100/100
- **SEO** : 100/100

## 🛠️ Suite de tests Lighthouse

Nous avons développé une suite complète de tests Lighthouse qui permet de :

- Tester les pages principales (accueil, connexion, profil)
- Tester les pages avec authentification
- Comparer les performances avec une référence (baseline)
- Détecter les régressions de performance

## 📈 Stratégie de test dans différents environnements

Les scores Lighthouse peuvent varier considérablement selon l'environnement :

| Environnement | Caractéristiques                              | Approche de test                  |
| ------------- | --------------------------------------------- | --------------------------------- |
| Développement | Ressources limitées, serveur de développement | Détection des régressions         |
| CI/CD         | Environnement standardisé, headless           | Seuils adaptés (~50% performance) |
| Production    | Optimisé, mise en cache, CDN                  | Scores élevés (>90%)              |

## 🧪 Comment exécuter les tests

```bash
# Se placer dans le dossier lighthouse
cd lighthouse

# Test standard
pnpm test

# Suite complète de tests
pnpm test:suite

# Test avec authentification
pnpm test:auth

# Test rapide
pnpm test:quick

# Vérifier les régressions
pnpm test:ci
pnpm test:regression

# Archiver les anciens rapports (> 7 jours)
pnpm archive
```

## 🔬 Bonnes pratiques implémentées

- Compression de texte
- Minification du JavaScript
- Optimisation des images
- Préchargement des ressources critiques
- Réduction des changements de mise en page (CLS)
- Structure HTML sémantique pour l'accessibilité
