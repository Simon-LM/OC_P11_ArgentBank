<!-- @format -->

# Plan d'action - CI/CD et Vercel

## Objectif

Stabiliser ArgentBank comme projet vitrine portfolio, avec une méthode de travail professionnelle : branches, Pull Requests, CI/CD bloquant, publication Vercel maîtrisée, documentation vraie et tests fiables.

## Principe cible

```text
branche de travail -> Pull Request -> CI/CD obligatoire -> merge vers main -> publication Vercel
```

Le but est d'éviter le schéma dangereux suivant :

```text
push direct sur main -> publication Vercel -> CI/CD rouge après coup
```

## Phase 1 - Bloquer main et sécuriser la publication

- [ ] Ne plus pousser directement sur `main` pour les corrections.
- [ ] Créer une branche dédiée pour chaque sujet de correction.
- [ ] Ouvrir une Pull Request vers `main`.
- [ ] Activer une protection de branche ou un ruleset GitHub sur `main`.
- [ ] Rendre obligatoires les checks CI/CD principaux avant merge.
- [ ] Vérifier que Vercel ne publie la production qu'après un merge valide sur `main`.
- [ ] Décider si Vercel Git Integration reste active ou si la production doit être contrôlée uniquement par GitHub Actions.

### Checks à rendre obligatoires

- [ ] Lint.
- [ ] TypeScript.
- [ ] Tests unitaires / coverage.
- [ ] Build.
- [ ] Pa11y.
- [ ] Cypress.
- [ ] Lighthouse, au moins en mode contrôle explicite : bloquant ou warning documenté.

## Phase 2 - Vérifier le flux CI/CD vers Vercel

- [ ] Créer une branche de test.
- [ ] Ouvrir une Pull Request.
- [ ] Vérifier que la preview Vercel est créée.
- [ ] Vérifier que les tests s'exécutent sur la preview.
- [ ] Vérifier qu'un échec de test bloque le merge.
- [ ] Merger uniquement quand tous les checks requis sont verts.
- [ ] Confirmer que la production Vercel se met à jour seulement après ce merge.

## Phase 3 - Corriger Lighthouse

- [ ] Diagnostiquer l'échec Lighthouse sur `/user`.
- [ ] Aligner l'authentification Lighthouse sur l'attente SPA déjà utilisée par Pa11y.
- [ ] Décider les seuils professionnels : bloquants ou warnings.
- [ ] Relancer le workflow complet.
- [ ] Documenter le comportement attendu.

## Phase 4 - Corriger username et Upstash

- [ ] Diagnostiquer l'appel `POST /csrf/store`.
- [ ] Diagnostiquer l'appel `PUT /user/profile`.
- [ ] Vérifier si la nouvelle API Flask implémente ces routes.
- [ ] Corriger la modification du username.
- [ ] Clarifier le rôle actuel d'Upstash : encore utilisé, remplacé, ou à supprimer.
- [ ] Mettre à jour les tests Cypress associés.

## Phase 5 - Nettoyer la documentation

- [ ] Mettre à jour le README racine.
- [ ] Mettre à jour le README de `P11-ArgentBank`.
- [ ] Supprimer ou archiver les docs obsolètes sur l'ancienne API Vercel serverless si elles ne représentent plus l'architecture actuelle.
- [ ] Documenter clairement l'API Flask VPS.
- [ ] Documenter clairement la stratégie Vercel.
- [ ] Documenter clairement la stratégie CI/CD réelle.

## Phase 6 - Clarifier l'architecture du dépôt

- [ ] Décider si l'application reste dans `P11-ArgentBank/`.
- [ ] Si oui, documenter ce choix dans le README racine et dans Vercel.
- [ ] Si non, préparer une PR dédiée pour remonter l'application à la racine.
- [ ] Vérifier les chemins GitHub Actions, Vercel, Cypress, Pa11y et Lighthouse après décision.

## Règles de travail à partir de maintenant

- [ ] Une branche par sujet.
- [ ] Une Pull Request par correction logique.
- [ ] Pas de push direct sur `main` sauf urgence explicite.
- [ ] Pas de publication production sans CI/CD vert ou décision assumée et documentée.
- [ ] Pas de modification de config Vercel sans vérifier l'impact sur CI/CD.
- [ ] Toujours distinguer commit, push, merge, preview et production.

## Ordre de priorité actuel

1. Bloquer `main` et sécuriser la publication Vercel.
2. Vérifier que le flux PR -> CI/CD -> Vercel fonctionne.
3. Corriger Lighthouse.
4. Corriger la modification du username et le sujet Upstash.
5. Nettoyer les documentations.
6. Revoir l'architecture du dépôt.
