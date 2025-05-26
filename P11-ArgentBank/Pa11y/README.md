<!-- @format -->

# Pa11y Accessibility Testing

Ce dossier contient la configuration et les scripts pour automatiser les tests d’accessibilité avec Pa11y et Pa11y-CI, y compris l’authentification sur les pages protégées.

## Structure

- `pa11y-auth.js` : Script Node.js (Puppeteer) pour simuler la connexion utilisateur (remplit le formulaire de login et attend le dashboard).
- `pa11y-ci.config.js` : Configuration Pa11y-CI pour tester plusieurs routes, dont `/user` avec authentification.
- `README.md` : Ce guide.

## Utilisation

1. **Lancer le serveur local** (ex : `vercel dev` ou `pnpm dev`).
2. **Lancer les tests Pa11y-CI** :

```bash
pnpm exec pa11y-ci --config Pa11y/pa11y-ci.json
```

- Un screenshot sera généré (`pa11y-report.png`) pour chaque page.
- Les erreurs d’accessibilité seront affichées dans le terminal.

## Maintenance

- **Adapter les sélecteurs** dans `pa11y-auth.js` si le formulaire de connexion change.
- **Ajouter d’autres routes** dans `pa11y-ci.config.js` pour tester plus de pages.
- **Pour tester d’autres utilisateurs** : modifiez les identifiants dans `pa11y-auth.js`.

## Astuces

- Pour tester une page protégée, ajoutez une entrée dans `urls` avec `actions: 'script Pa11y/pa11y-auth.js'`.
- Pour tester sans authentification, ajoutez simplement l’URL.

---

Inspiré de la stratégie Lighthouse déjà en place dans ce projet.
