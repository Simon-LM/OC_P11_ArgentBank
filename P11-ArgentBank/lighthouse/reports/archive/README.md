<!-- @format -->

# Archives des rapports Lighthouse

Ce dossier contient les archives des anciens rapports Lighthouse organisés par date. Les rapports sont automatiquement archivés lorsqu'ils ont plus de 7 jours.

## Dernière archivage

**Date :** 2025-05-27  
**Rapports archivés :** 7 fichiers du 2025-05-26  
**Action :** Archivage manuel des rapports du 2025-05-26 après validation des nouveaux rapports du 2025-05-27

### Rapports archivés (2025-05-26)

- accueil---desktop-2025-05-26_16-40-38.html
- accueil---mobile-2025-05-26_16-40-38.html
- connexion---desktop-2025-05-26_16-40-38.html
- connexion---mobile-2025-05-26_16-40-38.html
- index-2025-05-26_16-40-38.html
- profil---desktop-2025-05-26_16-40-38.html
- profil---mobile-2025-05-26_16-40-38.html

## Structure

```plaintext
archive/
├── YYYY-MM-DD/        # Date de génération du rapport
│   ├── lighthouse-*.html  # Rapports HTML par date
│   └── lighthouse-*.json  # Données JSON par date
├── ...                # Autres dates
```

## Utilisation

Pour archiver manuellement les anciens rapports :

```bash
# Depuis le dossier lighthouse
pnpm archive
```

Ou directement :

```bash
./clean.sh --archive
```

## Conservation des données

Les archives sont conservées pour :

- Suivre l'évolution des performances au fil du temps
- Comparer les mesures entre différentes versions
- Documenter les améliorations apportées à l'application

Les rapports archivés ne sont pas supprimés lors du nettoyage standard des rapports.
