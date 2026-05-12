<!-- @format -->

# Plan d'action - CI/CD et Vercel

## Objectif

Stabiliser ArgentBank comme projet vitrine portfolio, avec une methode de travail professionnelle : branches, Pull Requests, CI/CD bloquant, publication Vercel maitrisee, documentation vraie et tests fiables.

## Principe cible

```text
branche de travail -> Pull Request -> CI/CD obligatoire -> merge vers main -> publication Vercel
```

Le but est d'eviter le schema dangereux suivant :

```text
push direct sur main -> publication Vercel -> CI/CD rouge apres coup
```

## Phase 1 - Bloquer main et securiser la publication

- [ ] Ne plus pousser directement sur `main` pour les corrections.
- [ ] Creer une branche dediee pour chaque sujet de correction.
- [ ] Ouvrir une Pull Request vers `main`.
- [ ] Activer une protection de branche ou un ruleset GitHub sur `main`.
- [ ] Rendre obligatoires les checks CI/CD principaux avant merge.
- [ ] Verifier que Vercel ne publie la production qu'apres un merge valide sur `main`.
- [ ] Decider si Vercel Git Integration reste active ou si la production doit etre controlee uniquement par GitHub Actions.

### Checks a rendre obligatoires

- [ ] Lint.
- [ ] TypeScript.
- [ ] Tests unitaires / coverage.
- [ ] Build.
- [ ] Pa11y.
- [ ] Cypress.
- [ ] Lighthouse, au moins en mode controle explicite : bloquant ou warning documente.

## Phase 2 - Verifier le flux CI/CD vers Vercel

- [ ] Creer une branche de test.
- [ ] Ouvrir une Pull Request.
- [ ] Verifier que la preview Vercel est creee.
- [ ] Verifier que les tests s'executent sur la preview.
- [ ] Verifier qu'un echec de test bloque le merge.
- [ ] Merger uniquement quand tous les checks requis sont verts.
- [ ] Confirmer que la production Vercel se met a jour seulement apres ce merge.

## Phase 3 - Corriger Lighthouse

- [ ] Diagnostiquer l'echec Lighthouse sur `/user`.
- [ ] Aligner l'authentification Lighthouse sur l'attente SPA deja utilisee par Pa11y.
- [ ] Decider les seuils professionnels : bloquants ou warnings.
- [ ] Relancer le workflow complet.
- [ ] Documenter le comportement attendu.

## Phase 4 - Corriger username et Upstash

- [ ] Diagnostiquer l'appel `POST /csrf/store`.
- [ ] Diagnostiquer l'appel `PUT /user/profile`.
- [ ] Verifier si la nouvelle API Flask implemente ces routes.
- [ ] Corriger la modification du username.
- [ ] Clarifier le role actuel d'Upstash : encore utilise, remplace, ou a supprimer.
- [ ] Mettre a jour les tests Cypress associes.

## Phase 5 - Nettoyer la documentation

- [ ] Mettre a jour le README racine.
- [ ] Mettre a jour le README de `P11-ArgentBank`.
- [ ] Supprimer ou archiver les docs obsoletes sur l'ancienne API Vercel serverless si elles ne representent plus l'architecture actuelle.
- [ ] Documenter clairement l'API Flask VPS.
- [ ] Documenter clairement la strategie Vercel.
- [ ] Documenter clairement la strategie CI/CD reelle.

## Phase 6 - Clarifier l'architecture du depot

- [ ] Decider si l'application reste dans `P11-ArgentBank/`.
- [ ] Si oui, documenter ce choix dans le README racine et dans Vercel.
- [ ] Si non, preparer une PR dediee pour remonter l'application a la racine.
- [ ] Verifier les chemins GitHub Actions, Vercel, Cypress, Pa11y et Lighthouse apres decision.

## Regles de travail a partir de maintenant

- [ ] Une branche par sujet.
- [ ] Une Pull Request par correction logique.
- [ ] Pas de push direct sur `main` sauf urgence explicite.
- [ ] Pas de publication production sans CI/CD vert ou decision assumee et documentee.
- [ ] Pas de modification de config Vercel sans verifier l'impact sur CI/CD.
- [ ] Toujours distinguer commit, push, merge, preview et production.

## Ordre de priorite actuel

1. Bloquer `main` et securiser la publication Vercel.
2. Verifier que le flux PR -> CI/CD -> Vercel fonctionne.
3. Corriger Lighthouse.
4. Corriger la modification du username et le sujet Upstash.
5. Nettoyer les documentations.
6. Revoir l'architecture du depot.
