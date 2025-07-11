<!-- @format -->

# 🎯 Best Practices Guide - ArgentBank Accessibility

## 🏆 Quality Standards

### WCAG 2.1 AA Compliance Objectives

#### ✅ Level A (Minimum)

- **Alternative text**: All images have appropriate `alt` attributes
- **HTML structure**: Correct use of semantic tags
- **Keyboard navigation**: All interactive elements accessible via keyboard
- **Form labels**: All fields have explicit labels

#### ✅ Level AA (ArgentBank Standard)

- **Color contrast**: Minimum 4.5:1 ratio for normal text
- **Resizing**: Interface usable up to 200% zoom
- **Consistent navigation**: Logical tab order
- **Error identification**: Clear and accessible error messages

## 🎨 Accessible Design Guidelines

### Colors and Contrasts

```scss
// ✅ Recommended contrasts
$color-primary: #00bc77; // 7.8:1 contrast on white
$color-text: #2c3e50; // 8.2:1 contrast on white
$color-error: #e74c3c; // 5.4:1 contrast on white

// ❌ Avoid
$color-light-gray: #cccccc; // Insufficient contrast 2.1:1
```

### Typography

```scss
// ✅ Minimum sizes
$font-size-base: 16px; // Minimum for body text
$font-size-small: 14px; // Minimum for annotations
$line-height: 1.5; // Recommended line spacing

// ✅ Heading hierarchy
h1 {
  font-size: 2.25rem;
} // 36px
h2 {
  font-size: 1.875rem;
} // 30px
h3 {
  font-size: 1.5rem;
} // 24px
```

## 🔧 Development Patterns

### Accessible Forms

#### ✅ Structure Recommandée

```tsx
// Champ de formulaire accessible
<div className="input-wrapper">
  <label htmlFor="username" className="sr-only">
    Nom d'utilisateur
  </label>
  <input
    type="text"
    id="username"
    name="username"
    placeholder="Nom d'utilisateur"
    aria-required="true"
    aria-describedby="username-error username-help"
    aria-invalid={hasError ? "true" : "false"}
  />
  <div id="username-help" className="input-help">
    Entrez votre nom d'utilisateur ArgentBank
  </div>
  {hasError && (
    <div id="username-error" className="error-message" role="alert">
      Nom d'utilisateur requis
    </div>
  )}
</div>
```

#### ❌ Anti-patterns à Éviter

```tsx
// ❌ Label manquant
<input type="text" placeholder="Nom d'utilisateur" />

// ❌ Label non associé
<label>Nom d'utilisateur</label>
<input type="text" />

// ❌ Erreur non accessible
<input type="text" />
<span style="color: red">Erreur</span>
```

### Navigation et Focus

#### ✅ Gestion du Focus

```tsx
// Skip link pour navigation rapide
<a href="#main-content" className="skip-link">
  Aller au contenu principal
</a>

// Zone principale identifiée
<main id="main-content" role="main">
  <h1>Titre de la page</h1>
  {/* Contenu principal */}
</main>

// Navigation avec état actuel
<nav role="navigation" aria-label="Navigation principale">
  <ul>
    <li>
      <a href="/home" aria-current={isHome ? 'page' : undefined}>
        Accueil
      </a>
    </li>
  </ul>
</nav>
```

#### ✅ Ordre de Tabulation

```tsx
// Ordre logique avec tabindex si nécessaire
<div className="modal">
  <h2 tabIndex="-1" ref={titleRef}>
    Titre du modal
  </h2>
  <button tabIndex="0">Action principale</button>
  <button tabIndex="0">Action secondaire</button>
  <button tabIndex="0" onClick={closeModal}>
    Fermer
  </button>
</div>
```

### Images et Médias

#### ✅ Texte Alternatif Approprié

```tsx
// Image informative
<img
  src="/img/icon-security.png"
  alt="Sécurité bancaire - Protection des données"
  className="feature-icon"
/>

// Image décorative
<img
  src="/img/background-pattern.jpg"
  alt=""
  role="presentation"
/>

// Image complexe avec description
<img
  src="/img/transaction-chart.png"
  alt="Graphique des transactions"
  aria-describedby="chart-description"
/>
<div id="chart-description">
  Évolution des transactions sur 12 mois, montrant une augmentation de 15%
</div>
```

## 🧪 Tests d'Accessibilité

### Tests Automatisés avec Axe

#### ✅ Test de Composant Standard

```tsx
// Test d'accessibilité basique
describe("Feature Component", () => {
  it("doit être accessible", async () => {
    const { container } = render(
      <Feature
        icon="security"
        title="Sécurité bancaire"
        description="Protection de vos données"
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

#### ✅ Test avec Règles Spécifiques

```tsx
// Test ciblé sur les formulaires
it("formulaire doit avoir des labels corrects", async () => {
  const { container } = render(<SignInForm />);

  const results = await axe(container, {
    rules: {
      label: { enabled: true },
      "form-field-multiple-labels": { enabled: true },
      "input-button-name": { enabled: true },
    },
  });

  expect(results).toHaveNoViolations();
});
```

### Tests Manuels Essentiels

#### ✅ Navigation Clavier

1. **Tab** : Parcourir tous les éléments interactifs
2. **Shift+Tab** : Navigation inverse
3. **Enter/Espace** : Activer boutons et liens
4. **Flèches** : Navigation dans les menus/listes
5. **Échap** : Fermer modals/menus

#### ✅ Tests de Lecteur d'Écran

1. **Structure** : Titres et landmarks lus correctement
2. **Contenu** : Texte et descriptions appropriés
3. **États** : Boutons actifs/inactifs annoncés
4. **Erreurs** : Messages d'erreur lus automatiquement

## 📱 Responsive et Accessibilité

### Design Mobile Accessible

#### ✅ Tailles de Touch Targets

```scss
// Tailles minimales pour les éléments tactiles
.button,
.link,
.input {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

// Espacement entre éléments tactiles
.touch-target + .touch-target {
  margin-top: 8px;
}
```

#### ✅ Zoom et Redimensionnement

```scss
// Responsive sans scroll horizontal
.container {
  max-width: 100%;
  overflow-x: hidden;
}

// Texte redimensionnable
html {
  font-size: 16px; // Base pour rem
}

@media (min-width: 768px) {
  html {
    font-size: 18px; // Légèrement plus grand sur desktop
  }
}
```

## 🎯 Checklist de Développement

### Avant Chaque Commit ✅

- [ ] Tous les tests Axe passent : `pnpm test:axe`
- [ ] Navigation clavier testée manuellement
- [ ] Contraste vérifié avec les outils navigateur
- [ ] Attributs ARIA appropriés ajoutés
- [ ] Textes alternatifs rédigés

### Avant Chaque Release ✅

- [ ] Tests complets d'accessibilité sur toutes les pages
- [ ] Validation avec lecteur d'écran (NVDA/JAWS)
- [ ] Tests sur mobile avec zoom 200%
- [ ] Vérification des performances avec accessibility tree

## 🔧 Outils Recommandés

### Extensions Navigateur

- **axe DevTools** : Tests automatisés en temps réel
- **WAVE** : Visualisation des erreurs d'accessibilité
- **Lighthouse** : Audit complet incluant l'accessibilité
- **Color Oracle** : Simulation de daltonisme

### Outils de Test

- **NVDA** : Lecteur d'écran gratuit pour Windows
- **VoiceOver** : Lecteur d'écran macOS/iOS
- **Axe CLI** : Tests en ligne de commande

### Validation

```bash
# Tests locaux rapides
pnpm test:axe

# Audit Lighthouse
pnpm lighthouse

# Tests Pa11y (pages complètes)
pnpm test:a11y
```

## 📊 Métriques de Qualité

### KPIs Accessibilité ArgentBank

#### 🎯 Objectifs Niveau AA

- **0 violations critiques** (impact: critical)
- **≤ 2 violations sérieuses** (impact: serious)
- **≤ 5 violations modérées** (impact: moderate)
- **100% couverture composants** (tests Axe)

#### 📈 Suivi Continu

- Tests automatisés dans CI/CD
- Rapport hebdomadaire des métriques
- Audit manuel mensuel
- Formation équipe trimestrielle

## 💡 Cas d'Usage ArgentBank

### Page d'Accueil

```tsx
// Structure accessible de la hero section
<section className="hero" aria-labelledby="hero-title">
  <div className="hero-content">
    <h1 id="hero-title">Bienvenue sur ArgentBank</h1>
    <p className="hero-subtitle">Banque en ligne simple et sécurisée</p>
    <Link to="/sign-in" className="cta-button">
      Ouvrir un compte
    </Link>
  </div>
</section>
```

### Formulaire de Connexion

```tsx
// Formulaire accessible avec gestion d'erreurs
<form onSubmit={handleSubmit} noValidate>
  <fieldset>
    <legend>Connexion à votre compte</legend>

    <InputField
      id="username"
      type="text"
      label="Nom d'utilisateur"
      value={username}
      onChange={setUsername}
      error={errors.username}
      required
    />

    <InputField
      id="password"
      type="password"
      label="Mot de passe"
      value={password}
      onChange={setPassword}
      error={errors.password}
      required
    />

    <button type="submit" disabled={isLoading}>
      {isLoading ? "Connexion..." : "Se connecter"}
    </button>
  </fieldset>
</form>
```

### Navigation Principale

```tsx
// Navigation avec état et ARIA
<nav role="navigation" aria-label="Navigation principale">
  <ul className="nav-menu">
    <li>
      <Link
        to="/profile"
        aria-current={isProfile ? "page" : undefined}
        className={`nav-link ${isProfile ? "active" : ""}`}
      >
        <Icon name="user" aria-hidden="true" />
        <span>Profil</span>
      </Link>
    </li>
    <li>
      <button onClick={handleLogout} className="nav-link" type="button">
        <Icon name="logout" aria-hidden="true" />
        <span>Se déconnecter</span>
      </button>
    </li>
  </ul>
</nav>
```

---

## 📚 Ressources Complémentaires

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Guidelines](https://webaim.org/guidelines/)
- [Axe Rules Documentation](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)

---

**🎯 Cette approche garantit que ArgentBank respecte les standards d'accessibilité les plus élevés tout en maintenant une expérience utilisateur exceptionnelle pour tous.**
