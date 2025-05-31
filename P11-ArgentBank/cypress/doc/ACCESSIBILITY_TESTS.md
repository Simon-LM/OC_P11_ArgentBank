<!-- @format -->

# Guide des Tests d'Accessibilité avec Cypress-Axe

Ce guide explique comment implémenter et maintenir des tests d'accessibilité automatisés avec `cypress-axe` dans le projet ArgentBank.

## 📋 Vue d'ensemble

Les tests d'accessibilité automatisés permettent de détecter les violations des standards WCAG 2.1 directement dans les tests E2E, assurant que l'application reste accessible à tous les utilisateurs.

## 🎯 Objectifs des tests d'accessibilité

- ✅ Vérifier la conformité WCAG 2.1 AA
- ✅ Détecter les problèmes d'accessibilité automatiquement
- ✅ Intégrer l'accessibilité dans le processus de développement
- ✅ Prévenir les régressions d'accessibilité
- ✅ Générer des rapports détaillés sur les violations

## 🛠️ Configuration

### Installation des dépendances

```bash
pnpm add -D cypress-axe axe-core
```

### Configuration dans cypress/support/e2e.ts

```typescript
import "cypress-axe";
```

### Configuration Cypress (cypress.config.ts)

```typescript
export default defineConfig({
	e2e: {
		// Configuration du reporter pour les tests d'accessibilité
		reporter: "mochawesome",
		reporterOptions: {
			reportDir: "cypress/reports",
			overwrite: false,
			html: true,
			json: true,
			timestamp: "mmddyyyy_HHMMss",
		},
		// ...autres configurations
	},
});
```

## 📁 Structure des tests d'accessibilité

### Intégration dans les tests existants

Les tests d'accessibilité sont intégrés directement dans chaque fichier de test E2E :

```text
cypress/
└── e2e/
    ├── auth/
    │   ├── login.cy.ts          # Tests de connexion + accessibilité
    │   └── logout.cy.ts         # Tests de déconnexion + accessibilité
    ├── accounts/
    │   └── accounts.cy.ts       # Tests de comptes + accessibilité
    ├── profile/
    │   └── profile.cy.ts        # Tests de profil + accessibilité
    └── transactions/
        └── transactions/            # Tests des transactions + accessibilité
            ├── transactions-display.cy.ts      # Tests d'affichage
            └── transactions-functionality.cy.ts # Tests de fonctionnalités
```

## 🔧 Utilisation de cypress-axe

### Pattern de base

```typescript
it("devrait être accessible", () => {
	// Injecter axe-core
	cy.injectAxe();

	// Tester l'accessibilité avec configuration personnalisée
	cy.checkA11y(undefined, {
		rules: {
			// Ignorer les violations de contraste connues
			"color-contrast": { enabled: false },
		},
	});
});
```

### Pattern avancé avec focus

```typescript
it("devrait être accessible avec navigation clavier", () => {
	cy.injectAxe();

	// Test d'accessibilité initial
	cy.checkA11y(undefined, {
		rules: {
			"color-contrast": { enabled: false },
		},
	});

	// Tester l'accessibilité avec focus sur un élément
	cy.get('button[class*="account"]').first().focus();
	cy.checkA11y(undefined, {
		rules: {
			"color-contrast": { enabled: false },
		},
	});
});
```

## 📝 Règles d'accessibilité configurées

### Règles désactivées et pourquoi

1. **color-contrast** : Désactivée temporairement
   - Raison : Violations de contraste connues dans le design actuel
   - Action : À traiter dans une itération dédiée au design

### Règles activées par défaut

- **keyboard** : Navigation clavier
- **focus** : Gestion du focus
- **aria** : Attributs ARIA
- **forms** : Étiquetage des formulaires
- **headings** : Structure des titres
- **images** : Textes alternatifs
- **links** : Accessibilité des liens

## 🚀 Scripts NPM configurés

### Tests d'accessibilité spécifiques

```bash
# Exécuter tous les tests avec focus accessibilité
pnpm run test:e2e:a11y

# Exécuter les tests avec rapport consolidé
pnpm run test:e2e:a11y:report

# Nettoyer les anciens rapports
pnpm run test:e2e:clean
```

### Scripts dans package.json

```json
{
	"scripts": {
		"test:e2e:a11y": "cypress run --spec 'cypress/e2e/**/*.cy.ts'",
		"test:e2e:a11y:report": "cypress run --spec 'cypress/e2e/**/*.cy.ts' && pnpm run test:e2e:merge-reports",
		"test:e2e:merge-reports": "mochawesome-merge cypress/reports/mochawesome_*.json > cypress/reports/merged-report.json && marge cypress/reports/merged-report.json --reportDir cypress/reports/html",
		"test:e2e:clean": "bash cypress/clean-reports.sh"
	}
}
```

## 📊 Rapports d'accessibilité

### Génération des rapports

Les rapports sont automatiquement générés dans `cypress/reports/` :

- **Rapports individuels** : `mochawesome_*.json` et `mochawesome_*.html`
- **Rapport consolidé** : `merged-report.json` et `html/merged-report.html`

### Interprétation des résultats

- ✅ **Vert** : Aucune violation détectée
- ❌ **Rouge** : Violations d'accessibilité trouvées
- ⚠️ **Orange** : Avertissements à examiner

### Exemple de violation

```
Rule ID: aria-label-missing
Impact: Critical
Description: Ensure every form element has a label
Nodes: 2
```

## 🔍 Tests par page/fonctionnalité

### Page de connexion (`login.cy.ts`)

```typescript
// Tests d'accessibilité intégrés
it("devrait permettre à un utilisateur de se connecter", function () {
	cy.injectAxe();
	cy.checkA11y(undefined, {
		rules: { "color-contrast": { enabled: false } },
	});

	// ...logique de test de connexion

	// Test après connexion
	cy.checkA11y(undefined, {
		rules: { "color-contrast": { enabled: false } },
	});
});

it("devrait être accessible sur la page de connexion", () => {
	cy.injectAxe();
	cy.checkA11y(undefined, {
		rules: { "color-contrast": { enabled: false } },
	});

	// Tests de focus
	cy.get("input#email").focus();
	cy.checkA11y();

	cy.get("input#password").focus();
	cy.checkA11y();
});
```

### Page des comptes (`accounts.cy.ts`)

```typescript
it("devrait être accessible sur la page des comptes", () => {
	cy.injectAxe();
	cy.checkA11y(undefined, {
		rules: { "color-contrast": { enabled: false } },
	});

	// Test d'accessibilité des boutons de compte
	cy.get('button[class*="account"]').first().focus();
	cy.checkA11y();

	// Test après sélection du compte
	cy.get('button[class*="account"]').first().click();
	cy.checkA11y();
});
```

### Page des transactions (`transactions-display.cy.ts` et `transactions-functionality.cy.ts`)

```typescript
it("devrait être accessible sur la page des transactions", () => {
	cy.injectAxe();
	cy.checkA11y(undefined, {
		rules: { "color-contrast": { enabled: false } },
	});

	// Test du tableau de transactions
	cy.get('table[class*="transaction-table"]').should("be.visible");
	cy.checkA11y();

	// Test conditionnel de la pagination (éviter les boutons désactivés)
	cy.get('button[class*="pagination"]').then(($buttons) => {
		const enabledButtons = $buttons.filter(":not(:disabled)");
		if (enabledButtons.length > 0) {
			cy.wrap(enabledButtons.first()).focus();
			cy.checkA11y();
		}
	});
});
```

## ⚠️ Points d'attention

### Injection d'axe-core

- **Toujours injecter** `cy.injectAxe()` au début de chaque test d'accessibilité
- **Ne pas injecter** dans `beforeEach` car cela interfère avec le processus de connexion
- **Injecter individuellement** dans chaque test qui en a besoin

### Gestion des éléments conditionnels

```typescript
// ✅ Bon : Vérification conditionnelle
cy.get('button[class*="pagination"]').then(($buttons) => {
	const enabledButtons = $buttons.filter(":not(:disabled)");
	if (enabledButtons.length > 0) {
		cy.wrap(enabledButtons.first()).focus();
		cy.checkA11y();
	}
});

// ❌ Mauvais : Tentative de focus sur un élément désactivé
cy.get('button[class*="pagination"]').first().focus(); // Peut échouer
```

### Configuration des règles

```typescript
// Configuration recommandée pour ignorer les violations connues
const a11yConfig = {
	rules: {
		"color-contrast": { enabled: false }, // Temporairement désactivé
		// Ajouter d'autres règles selon les besoins
	},
};

cy.checkA11y(undefined, a11yConfig);
```

## 🚀 Maintenance et évolution

### Ajout de nouveaux tests d'accessibilité

1. **Créer le test de base** avec les vérifications fonctionnelles
2. **Ajouter l'injection d'axe** : `cy.injectAxe()`
3. **Ajouter les vérifications** : `cy.checkA11y()`
4. **Tester les interactions** : focus, navigation clavier, etc.
5. **Configurer les règles** selon les besoins spécifiques

### Suivi des violations

1. **Exécuter régulièrement** les tests d'accessibilité
2. **Analyser les rapports** pour identifier les nouvelles violations
3. **Prioriser les corrections** selon l'impact
4. **Réactiver les règles** une fois les violations corrigées

### Intégration CI/CD

```yaml
# Exemple pour GitHub Actions
- name: Run accessibility tests
  run: |
    pnpm run test:e2e:a11y:report

- name: Upload accessibility reports
  uses: actions/upload-artifact@v3
  with:
    name: accessibility-reports
    path: cypress/reports/html/
```

## 📚 Ressources

- [Cypress-Axe Documentation](https://github.com/component-driven/cypress-axe)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe-Core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Cypress Best Practices](./BEST_PRACTICES.md)

## 🎯 Prochaines étapes

1. **Corriger les violations de contraste** identifiées
2. **Ajouter des tests d'accessibilité** pour les nouvelles fonctionnalités
3. **Automatiser l'exécution** dans la pipeline CI/CD
4. **Former l'équipe** aux bonnes pratiques d'accessibilité

---

> **Note** : Ce guide fait partie de la documentation complète des tests Cypress. Consultez également [E2E_TESTS.md](./E2E_TESTS.md) et [BEST_PRACTICES.md](./BEST_PRACTICES.md) pour une vue d'ensemble complète.
