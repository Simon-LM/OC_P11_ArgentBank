<!-- @format -->

# Configuration Markdownlint

Ce fichier configure les règles markdownlint pour le projet ArgentBank.

## Règles désactivées

Les règles suivantes ont été désactivées car elles ne posent pas de problème sur GitHub et peuvent parfois être trop restrictives :

- **MD010** : Tabulations dans le code (acceptable avec les outils modernes)
- **MD013** : Longueur de ligne (acceptable sur GitHub avec défilement horizontal)
- **MD024** : Titres dupliqués (acceptable dans différentes sections)
- **MD026** : Ponctuation dans les titres (les ":" sont courants et acceptables)
- **MD031** : Lignes vides autour des blocs de code (pas critique pour la lisibilité)
- **MD032** : Lignes vides autour des listes (pas critique pour GitHub)
- **MD034** : URLs nues dans les tableaux (acceptable sur GitHub, liens cliquables)
- **MD036** : Emphase utilisée comme titre (acceptable dans certains contextes)
- **MD037** : Espaces dans les marqueurs d'emphase (bien géré par GitHub)
- **MD040** : Langue des blocs de code (pas toujours nécessaire)
- **MD041** : Première ligne doit être un titre H1 (pas toujours requis)

## Règles conservées

Toutes les autres règles markdownlint restent actives pour maintenir la qualité et la cohérence de la documentation.

## Utilisation

```bash
# Vérifier tous les fichiers markdown
npx markdownlint "**/*.md" --ignore node_modules

# Vérifier un fichier spécifique
npx markdownlint README.md
```
