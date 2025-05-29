<!-- @format -->

# Guide de Maintenance des Tests - Vitest

Ce guide fournit les bonnes pratiques pour maintenir les tests Vitest du projet ArgentBank sur le long terme.

## 🔄 Cycle de vie des tests

### Quand mettre à jour les tests

- ✅ Lors de changements de l'API d'un composant
- ✅ Lors d'ajout de nouvelles fonctionnalités
- ✅ Lors de correction de bugs
- ✅ Lors de changements de dépendances majeures
- ✅ Lors de refactoring

### Signes que les tests ont besoin d'attention

- 🚩 Tests échouant sans modifications du code testé
- 🚩 Tests peu fiables (passant/échouant aléatoirement)
- 🚩 Couverture de code diminuant
- 🚩 Tests prenant de plus en plus de temps
- 🚩 Tests contenant trop de mocks ou de complexité

## 📈 Amélioration continue

### Analyse des tests existants

```bash
# Identifier les tests les plus lents
pnpm test -- --reporter=verbose | grep "took"

# Identifier les tests qui échouent le plus souvent
pnpm test:watch -- --reporterUpdateInterval=1000
```

### Refactoring de tests

Principes à suivre :

1. **Clarifier l'intention** : Noms de tests explicites
2. **Simplifier** : Réduire la complexité et les dépendances
3. **Consolider** : Regrouper les tests similaires
4. **Isoler** : Assurer l'indépendance des tests

Exemple de refactoring :

```typescript
// Avant
it('test that component works', () => {
  render(<Component prop1="a" prop2="b" prop3="c" prop4="d" />);
  fireEvent.click(screen.getByText('Click'));
  expect(screen.getByText('Result')).toBeInTheDocument();
});

// Après
it('displays result when button is clicked', () => {
  // Arrangement
  const defaultProps = { prop1: "a", prop2: "b", prop3: "c", prop4: "d" }; // Définir defaultProps
  render(<Component {...defaultProps} />);
  const button = screen.getByRole('button', { name: /click/i });

  // Action
  fireEvent.click(button);

  // Assertion
  expect(screen.getByText('Result')).toBeInTheDocument();
});
```

## 🐛 Résolution de problèmes courants

### Tests instables (flaky)

Causes fréquentes :

- Attentes asynchrones mal gérées
- Dépendances entre tests
- Timeouts trop courts
- État global non réinitialisé

Solutions :

- Utiliser `waitFor` ou `findBy*` pour les opérations asynchrones
- Ajouter `vi.clearAllMocks()` dans `afterEach`
- Augmenter les timeouts pour les tests lents
- Isoler chaque test avec un état initial propre

```typescript
// Correction d'un test asynchrone instable
it('fetches and displays data', async () => {
  // Setup mocks
  const mockFetchData = vi.fn(); // Assurez-vous que mockFetchData est défini
  mockFetchData.mockResolvedValue({ name: 'Test User' });

  render(<UserProfile userId="123" />);

  // Utiliser findBy au lieu de getBy pour attendre le résultat
  await screen.findByText('Test User');
  expect(mockFetchData).toHaveBeenCalledWith('123');
});
```

### Problèmes de mémoire

Si les tests consomment trop de mémoire :

- Exécuter les tests par groupes plus petits
- Nettoyer les ressources dans `afterEach`
- Surveiller les fuites mémoire avec `--logHeapUsage`

```bash
# Détecter les fuites mémoire
pnpm test -- --logHeapUsage
```

## 📊 Surveillance de la qualité

### Métriques clés

1. **Couverture de code** : Maintenir ou améliorer la couverture existante
2. **Temps d'exécution** : Garder les tests rapides (< 30s pour la suite complète)
3. **Fiabilité** : 0% de tests instables
4. **Maintenabilité** : Code de test lisible et bien structuré

### Revues régulières

Planifier des revues trimestrielles pour :

- Identifier les zones sous-testées
- Améliorer les tests lents
- Mettre à jour les mocks obsolètes
- Simplifier les tests complexes

## 🚀 Mise à niveau des dépendances

### Stratégie de mise à jour

1. **Préparation** :

   - Capturer les métriques actuelles (couverture, vitesse)
   - Exécuter tous les tests pour avoir un baseline

2. **Mise à jour progressive** :

   - Mettre à jour une dépendance à la fois
   - Exécuter les tests après chaque mise à jour
   - Documenter les changements nécessaires

3. **Vérification** :
   - Comparer les métriques avant/après
   - Vérifier que tous les tests passent
   - Rechercher les avertissements de dépréciation

### Dépendances critiques

Pour les mises à jour majeures de ces dépendances, vérifier la compatibilité :

- Vitest
- Testing Library
- React
- Redux Toolkit
- TypeScript

```bash
# Vérifier les dépendances obsolètes
pnpm outdated

# Mettre à jour une dépendance spécifique
pnpm update @testing-library/react

# Mettre à jour toutes les dépendances de test
pnpm update -r "@testing-library/*" vitest
```

## 🧰 Outils de diagnostic

### Débogage des tests

```bash
# Mode debug avec pause
pnpm test:debug -- Button.test.tsx

# Mode UI
pnpm test:ui

# Mode verbose
pnpm test -- --reporter=verbose
```

### Scripts utiles

Ajouter ces scripts à `package.json` :

```json
{
	"scripts": {
		"test:find-slow": "pnpm test -- --reporter=verbose | grep -B 1 -A 1 'took.*>100ms'",
		"test:find-flaky": "pnpm test -- --retry=3 --reporter=json | jq '.testResults[] | select(.retry > 0)'",
		"test:by-file": "node scripts/run-tests-by-size.js",
		"test:watch-coverage": "pnpm test:coverage -- --watch"
	}
}
```

## 📝 Documentation continue

### Documentation des patterns

Pour chaque nouveau pattern de test :

1. Documenter le problème résolu
2. Fournir un exemple minimal
3. Expliquer quand l'utiliser
4. Ajouter à la documentation appropriée

### Bibliothèque de tests

Maintenir une bibliothèque d'exemples de tests pour les cas courants :

- Formulaires avec validation
- Requêtes API
- Composants contrôlés vs non-contrôlés
- Routes protégées
- État global avec Redux

## 👥 Bonnes pratiques d'équipe

### Code reviews

Checklist pour les revues de code de test :

- [ ] Les tests vérifient le comportement, pas l'implémentation
- [ ] Les noms de tests sont descriptifs et basés sur le comportement
- [ ] Les arrangements, actions et assertions sont clairement séparés
- [ ] Les mocks sont minimaux et explicites
- [ ] Les tests sont indépendants les uns des autres

### Sessions de pair-testing

Organiser des sessions où deux développeurs :

1. Écrivent des tests ensemble
2. Examinent et améliorent des tests existants
3. Partagent des techniques et astuces

## 🔄 Intégration continue

### Optimisation du pipeline CI

1. **Mise en cache** :

   - Mettre en cache les dépendances node_modules
   - Mettre en cache les résultats de compilation TypeScript

2. **Parallélisation** :

   - Diviser les tests en groupes équilibrés
   - Exécuter les groupes en parallèle

3. **Fail fast** :
   - Échouer dès le premier test en échec
   - Exécuter d'abord les tests les plus susceptibles d'échouer

```yaml
# Exemple d'optimisation dans GitHub Actions
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Cache node_modules
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ runner.os }}-modules-${{ hashFiles('pnpm-lock.yaml') }}

      - name: Run critical tests first
        run: pnpm test -- --grep="^(Authentication|User)"

      - name: Run remaining tests
        run: pnpm test -- --exclude="^(Authentication|User)"
```

## 🚦 Maintenance préventive

### Vérifications régulières

Exécuter ces vérifications mensuellement :

```bash
# Vérifier les tests lents
pnpm test -- --reporter=verbose | grep -B 1 -A 1 "took.*>100ms"

# Vérifier les avertissements
pnpm test -- 2>&1 | grep -i "warning\|deprecated"

# Vérifier les tests désactivés
grep -r "it.skip\|describe.skip\|test.skip" --include="*.test.*" src/
```

### Plan de nettoyage

1. **Tests ignorés** : Examiner et corriger ou supprimer les tests `.skip`
2. **Tests dupliqués** : Consolider les tests redondants
3. **Tests obsolètes** : Supprimer les tests pour les fonctionnalités retirées
4. **Mocks inutilisés** : Nettoyer les mocks et fixtures non utilisés

---

**Navigation** : [Configuration](./CONFIGURATION.md) | [Architecture des tests](./TEST_ARCHITECTURE.md)
