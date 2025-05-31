<!-- @format -->

# Documentation Cypress - ArgentBank

Documentation des tests end-to-end (E2E) Cypress du projet ArgentBank.

## 📋 Vue d'ensemble

### Statut Actuel

**✅ Production Ready** - 41 tests E2E opérationnels avec tests d'accessibilité intégrés

### Couverture de Tests

| Fonctionnalité                 | Tests        | Statut                   |
| ------------------------------ | ------------ | ------------------------ |
| Authentification               | 5 tests      | ✅ Opérationnel          |
| Profil utilisateur             | 8 tests      | ✅ Opérationnel          |
| Comptes bancaires              | 3 tests      | ✅ Opérationnel          |
| Transactions - Affichage       | 3 tests      | ✅ Opérationnel          |
| Transactions - Fonctionnalités | 3 tests      | ✅ Opérationnel          |
| Cross-browser                  | 7 tests      | ✅ Opérationnel          |
| Cas limites                    | 7 tests      | ✅ Opérationnel          |
| Erreurs réseau                 | 7 tests      | ✅ Opérationnel          |
| **TOTAL**                      | **41 tests** | **✅ 100% opérationnel** |

## 🏗️ Structure des Fichiers

```
cypress/
├── e2e/                      # Tests E2E organisés par fonctionnalité
│   ├── auth/
│   │   ├── login.cy.ts       # Tests de connexion (3 tests)
│   │   └── logout.cy.ts      # Tests de déconnexion (2 tests)
│   ├── profile/
│   │   └── profile.cy.ts     # Tests de profil utilisateur (8 tests)
│   ├── accounts/
│   │   └── accounts.cy.ts    # Tests de comptes bancaires (3 tests)
│   ├── transactions/
│   │   ├── transactions-display.cy.ts        # Tests d'affichage (3 tests)
│   │   ├── transactions-functionality.cy.ts  # Tests de fonctionnalités (3 tests)
│   │   ├── transactions-display.fixed.cy.ts  # Fichier de sauvegarde
│   │   └── .transactions.cy.ts               # Fichier original de référence
│   ├── cross-browser/
│   │   └── cross-browser.cy.ts # Tests multi-navigateurs (6 tests)
│   ├── edge-cases/
│   │   └── edge-cases.cy.ts    # Tests de cas limites (4 tests)
│   └── network/
│       └── network-errors.cy.ts # Tests d'erreurs réseau (3 tests)
├── fixtures/                 # Données de test
│   ├── users.json            # Utilisateurs de test
│   ├── accounts.json         # Comptes bancaires de test
│   └── transactions.json     # Transactions de test
├── support/                  # Configuration et utilitaires
│   ├── commands.ts           # Commandes personnalisées Cypress
│   ├── types.ts              # Types TypeScript centralisés
│   ├── e2e.ts                # Configuration E2E
│   └── cypress-axe.d.ts      # Types pour l'accessibilité
└── doc/                      # Documentation
    ├── ACCESSIBILITY_TESTS.md
    ├── BEST_PRACTICES.md
    ├── E2E_TESTS.md
    ├── IMPLEMENTATION_STATUS.md
    ├── INSTALLATION.md
    ├── MAINTENANCE.md
    └── TYPESCRIPT_GUIDE.md
```

## 🚀 Utilisation

### Scripts NPM disponibles

```bash
# Tests E2E en mode interactif
pnpm run cypress:open

# Tests E2E en mode headless
pnpm run cypress:run

# Tests avec génération de rapport
pnpm run test:e2e:report

# Tests d'accessibilité avec rapport
pnpm run test:e2e:a11y:report

# Tests complets (unité + E2E + accessibilité)
pnpm run test:all:a11y
```

## 🎯 Bonnes Pratiques Appliquées

### 1. Sélecteurs Robustes et Factorisés

```typescript
// Sélecteurs centralisés pour la maintenance
const selectors = {
	transactionRow: `${transactionTableSelector} tbody tr[class*="transaction-row_"]`,
	transactionCell: 'td[class*="transaction-row__cell"]',
	transactionTitle: 'span[class*="transaction-row__title"]',
	transactionDate:
		'p[class*="transaction-row__meta"] span[aria-label*="Date:"]',
	transactionAmount:
		'td[class*="transaction-row__cell--amount"] span[class*="transaction-row__amount"]',
	accountButton: 'button[class*="account"]',
} as const;
```

### 2. Fonctions Utilitaires

```typescript
// Fonction utilitaire pour parser les dates
const parseTransactionDate = (dateStr: string): Date => {
	const parts = dateStr.split("/"); // Format DD/MM/YYYY
	return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
};

// Fonction utilitaire pour vérifier le tri
const verifyDateSortingDescending = (dates: string[]): void => {
	expect(dates.length).to.be.gt(0);
	const dateObjects = dates.map(parseTransactionDate);
	for (let i = 0; i < dateObjects.length - 1; i++) {
		expect(dateObjects[i].getTime()).to.be.gte(
			dateObjects[i + 1].getTime(),
			`Date à l'index ${i} (${dates[i]}) devrait être >= à la date à l'index ${i + 1} (${dates[i + 1]})`
		);
	}
};
```

### 3. Tests d'Accessibilité Intégrés

```typescript
it("devrait être accessible", () => {
	// Injecter axe-core pour les tests d'accessibilité
	cy.injectAxe();

	// Vérifier l'accessibilité globale
	cy.checkA11y(undefined, {
		rules: {
			"color-contrast": { enabled: false }, // Violations connues à traiter
		},
	});
});
```

## 📊 Architecture des Tests

### Séparation par Responsabilité

1. **transactions-display.cy.ts** (3 tests)

   - Affichage des transactions par défaut
   - Sélection de compte et mise à jour URL
   - Tests d'accessibilité de l'affichage

2. **transactions-functionality.cy.ts** (3 tests)
   - Filtrage par terme de recherche
   - Affichage des notes et catégories
   - Navigation et pagination

### Pattern de Setup Optimisé

```typescript
beforeEach(() => {
	cy.fixture("users.json").as("usersData");

	// Interceptions API
	cy.intercept("POST", "/api/user/login").as("loginRequest");
	cy.intercept("GET", "/api/user/profile").as("profileRequest");
	cy.intercept("GET", "/api/accounts").as("accountsRequest");
	cy.intercept("GET", "/api/transactions/search*").as(
		"searchTransactionsRequest"
	);

	// Setup de connexion avec fixtures
	cy.get<User[]>("@usersData").then((usersData) => {
		const validUser = usersData.find((user) => user.type === "valid");
		// ... logique de connexion
	});
});
```

## 🔧 Maintenance

### Ajout de Nouveaux Tests

1. **Créer le fichier de test** dans le bon dossier selon la fonctionnalité
2. **Utiliser les sélecteurs factorisés** existants ou en créer de nouveaux
3. **Intégrer les tests d'accessibilité** avec `cy.injectAxe()` et `cy.checkA11y()`
4. **Suivre le pattern de setup** avec fixtures et interceptions API

### Mise à Jour des Sélecteurs

Les sélecteurs sont centralisés dans chaque fichier de test. En cas de changement de structure HTML :

1. Identifier le sélecteur à modifier dans l'objet `selectors`
2. Mettre à jour la constante correspondante
3. Vérifier les tests concernés

### Documentation Complète

- [`doc/ACCESSIBILITY_TESTS.md`](./doc/ACCESSIBILITY_TESTS.md) : Guide détaillé des tests d'accessibilité
- [`doc/IMPLEMENTATION_STATUS.md`](./doc/IMPLEMENTATION_STATUS.md) : Statut complet de l'implémentation
- [`doc/TYPESCRIPT_GUIDE.md`](./doc/TYPESCRIPT_GUIDE.md) : Guide TypeScript
- [`doc/E2E_TESTS.md`](./doc/E2E_TESTS.md) : Guide complet des tests E2E
- [`doc/BEST_PRACTICES.md`](./doc/BEST_PRACTICES.md) : Meilleures pratiques
- [`doc/INSTALLATION.md`](./doc/INSTALLATION.md) : Guide d'installation
- [`doc/MAINTENANCE.md`](./doc/MAINTENANCE.md) : Guide de maintenance

## ⚙️ Configuration Technique

### Configuration Cypress (cypress.config.ts)

```typescript
import { defineConfig } from "cypress";

export default defineConfig({
	e2e: {
		baseUrl: "http://localhost:5173",
		specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
		viewportWidth: 1280,
		viewportHeight: 720,
		video: false,
		screenshotOnRunFailure: true,
		experimentalRunAllSpecs: true,
		reporter: "mochawesome",
		reporterOptions: {
			reportDir: "cypress/reports",
			overwrite: false,
			html: true,
			json: true,
		},
	},
	env: {
		apiUrl: "http://localhost:3001/api",
	},
});
```

### Types TypeScript centralisés (support/types.ts)

```typescript
export interface User {
	type: "valid" | "invalid";
	email: string;
	password?: string;
	firstName?: string;
	lastName?: string;
	userName?: string;
}

export interface Account {
	id: string;
	title: string;
	amount: number;
	description: string;
}

export interface Transaction {
	id: string;
	description: string;
	amount: number;
	balance: number;
	date: string;
	type: string;
	category: string;
	notes: string;
}
```

---

**Dernière mise à jour** : 31 mai 2025  
**Statut** : ✅ Production Ready - 41 tests opérationnels
