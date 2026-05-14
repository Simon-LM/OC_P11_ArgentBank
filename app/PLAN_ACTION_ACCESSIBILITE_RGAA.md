<!-- @format -->

# RGAA Accessibility Audit Plan | Plan d'Audit Accessibilité RGAA

> **Important Notice | Avis Important**  
> This document is bilingual (English/French). When updating this file, ensure both sections are modified accordingly.  
> Ce document est bilingue (anglais/français). Lors de la mise à jour de ce fichier, assurez-vous de modifier les deux sections en conséquence.

---

## 🇺🇸 ENGLISH VERSION

### 📋 Objective

Manual accessibility audit checklist based on Access42 RGAA training, focusing on technical details NOT covered by automated tools (Pa11y, Axe DevTools, Lighthouse).

### 🔧 Automated Tools Coverage (Already Active)

- **Pa11y** : Color contrast, basic landmarks, heading structure
- **Axe DevTools** : ARIA attributes, semantic HTML validation
- **Lighthouse** : Performance, basic accessibility scoring

### ⚠️ Manual Tests Required (Cannot be Automated)

#### 1. **Skip Links - RGAA 12.7 [A]**

- [ ] **Skip link present and functional**
  - Must be **first in DOM order**
  - Visible on focus (or always visible)
  - Points to `<main id="main" tabindex="-1">`
  - Explicit text: "Skip to main content" or "Content"

```html
<a href="#main" class="skip-link">Skip to main content</a>
<!-- ... navigation ... -->
<main id="main" tabindex="-1"></main>
```

#### 2. **Unique ARIA Landmarks - RGAA 12.1-12.2 [A]**

- [ ] **One unique `role="banner"` for main header**
- [ ] **One unique `role="main"` for main content**
- [ ] **One unique `role="contentinfo"` for footer**
- [ ] **Each `role="navigation"` with distinct `aria-label` if multiple**

#### 3. **Dynamic Page Titles - RGAA 8.5-8.6 [A]**

- ✅ **Each page has unique, descriptive `<title>`**
- ✅ **SPA: Dynamic title update on route changes**
- ✅ **Format: "Current Page - Site Name"**

#### 4. **Proper Screen Reader Classes**

- ✅ **Use correct visually-hidden class (recommended by Access42):**

```css
/* Nouvelle classe recommandée (remplace .sr-only) */
.visually-hidden,
.visually-hidden-focusable:not(:focus, :focus-within) {
  border: 0 !important;
  clip-path: inset(50%) !important;
  height: 1px !important;
  margin: -1px !important;
  overflow: hidden !important;
  padding: 0 !important;
  width: 1px !important;
  white-space: nowrap !important;
}
.visually-hidden:not(caption),
.visually-hidden-focusable:not(caption):not(:focus, :focus-within) {
  position: absolute !important;
}
.visually-hidden *,
.visually-hidden-focusable:not(:focus, :focus-within) * {
  overflow: hidden !important;
}
```

**Source:** [Improved sr-only par #FFOODD](https://gist.github.com/ffoodd/000b59f431e3e64e4ce1a24d5bb36034) - [Masquage accessible de pointe](https://www.ffoodd.fr/masquage-accessible-de-pointe/)

#### 5. **Form Autocomplete Attributes - RGAA 11.13 [AA]**

- [ ] **Username fields**: `autocomplete="username"`
- [ ] **Password fields**: `autocomplete="current-password"` or `autocomplete="new-password"`
- [ ] **First name**: `autocomplete="given-name"`
- [ ] **Last name**: `autocomplete="family-name"`
- [ ] **Email**: `autocomplete="email"`

#### 6. **Mobile Menu Accessibility**

- [ ] **Menu button INSIDE `<nav>` element**
- [ ] **Menu state communicated**: `aria-expanded="false/true"`
- [ ] **Explicit text**: "Main menu" (not just "Menu")

```html
<nav role="navigation" aria-label="Main navigation">
  <button aria-expanded="false" aria-controls="menu-items">Main menu</button>
  <ul id="menu-items">
    ...
  </ul>
</nav>
```

#### 7. **Two Navigation Methods - RGAA 12.1 [AA]**

- [ ] **Choose ANY TWO among**:
  - **Primary navigation menu**
  - **Sitemap** (complete site structure)
  - **Search engine** (must index ALL content)
  - **Breadcrumb** (hierarchical path: Home > Section > Current Page)

#### 8. **Document Language - RGAA 8.3-8.4 [A]**

- [ ] **Main language declared on `<html lang="fr">` or `<html lang="en">`**
- [ ] **Language changes marked**: `<span lang="en">English text</span>`
- [ ] **Valid ISO 639 language codes**

#### 9. **Complex Interactive Elements**

- [ ] **All iframe with descriptive `title`**
- [ ] **Data tables with `<caption>` or `aria-label`**
- [ ] **Table headers with `<th>` and `scope="col/row"`**

### 🧪 Manual Testing Protocol

#### Test 1: Skip Link Verification

1. Tab on first page load → skip link should appear
2. Press Enter on skip link → focus moves to `<main>`
3. Verify `<main>` has `tabindex="-1"`

#### Test 2: SPA Title Updates

1. Navigate between pages
2. Verify `document.title` changes for each route
3. Check format consistency

#### Test 3: Form Validation

1. Submit empty form
2. Verify focus moves to first field with error
3. Check `aria-describedby` on error fields
4. Verify autocomplete attributes

##### Test 3a: SignIn Form Specific Tests

**URL**: `/signin`

1. **Empty Form Submission**:
   - Leave both email and password fields empty
   - Click "Connect" button
   - **Expected**: Error message appears with `role="alert"`
   - **Expected**: Focus should move to first field with error (email field)
2. **Invalid Email Test**:
   - Enter invalid email (e.g., "invalid-email")
   - Enter valid password
   - Submit form
   - **Expected**: Focus moves to email field
   - **Expected**: Email field has `aria-invalid="true"`
   - **Expected**: Email field has `aria-describedby="error-message"`
3. **Invalid Credentials Test**:
   - Enter valid email format but wrong credentials
   - Submit form
   - **Expected**: General error message appears
   - **Expected**: Focus behavior should guide user to correction
4. **Autocomplete Verification**:
   - Email field: `autocomplete="username"`
   - Password field: `autocomplete="current-password"`

#### Test 4: Screen Reader Testing

1. Navigate with screen reader (NVDA recommended)
2. Test landmark navigation
3. Verify all interactive elements are announced
4. Test form completion flow

### � Reference Resources

- [RGAA 4.1 Criteria and Tests](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/)
- [Access42 Training Materials](A11y_Ressources/developpeur-master/formation/)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🇫🇷 VERSION FRANÇAISE

### � Objectif

Liste de contrôle d'audit d'accessibilité manuel basée sur la formation Access42 RGAA, se concentrant sur les détails techniques NON couverts par les outils automatiques (Pa11y, Axe DevTools, Lighthouse).

### 🔧 Couverture des Outils Automatiques (Déjà Actifs)

- **Pa11y** : Contrastes de couleur, landmarks de base, structure des titres
- **Axe DevTools** : Attributs ARIA, validation HTML sémantique
- **Lighthouse** : Performance, notation d'accessibilité de base

### ⚠️ Tests Manuels Requis (Non Automatisables)

#### 1. **Liens d'Évitement - RGAA 12.7 [A]**

- [ ] **Lien d'évitement présent et fonctionnel**
  - Doit être **en premier dans l'ordre DOM**
  - Visible à la prise de focus (ou toujours visible)
  - Pointe vers `<main id="main" tabindex="-1">`
  - Texte explicite : "Aller au contenu principal" ou "Contenu"

```html
<a href="#main" class="skip-link">Aller au contenu principal</a>
<!-- ... navigation ... -->
<main id="main" tabindex="-1"></main>
```

#### 2. **Landmarks ARIA Uniques - RGAA 12.1-12.2 [A]**

- [ ] **Un seul `role="banner"` unique pour l'en-tête principal**
- [ ] **Un seul `role="main"` unique pour le contenu principal**
- [ ] **Un seul `role="contentinfo"` unique pour le pied de page**
- [ ] **Chaque `role="navigation"` avec `aria-label` distinct si multiples**

#### 3. **Titres de Pages Dynamiques - RGAA 8.5-8.6 [A]**

- ✅ **Chaque page a un `<title>` unique et descriptif**
- ✅ **SPA : Mise à jour dynamique du titre lors des changements de route**
- ✅ **Format : "Page Courante - Nom du Site"**

#### 4. **Classes pour Lecteurs d'Écran Appropriées**

- ✅ **Utiliser la classe visually-hidden correcte (recommandée par Access42) :**

```css
/* Nouvelle classe recommandée (remplace .sr-only) */
.visually-hidden,
.visually-hidden-focusable:not(:focus, :focus-within) {
  border: 0 !important;
  clip-path: inset(50%) !important;
  height: 1px !important;
  margin: -1px !important;
  overflow: hidden !important;
  padding: 0 !important;
  width: 1px !important;
  white-space: nowrap !important;
}
.visually-hidden:not(caption),
.visually-hidden-focusable:not(caption):not(:focus, :focus-within) {
  position: absolute !important;
}
.visually-hidden *,
.visually-hidden-focusable:not(:focus, :focus-within) * {
  overflow: hidden !important;
}
```

**Source :** [Improved sr-only par #FFOODD](https://gist.github.com/ffoodd/000b59f431e3e64e4ce1a24d5bb36034) - [Masquage accessible de pointe](https://www.ffoodd.fr/masquage-accessible-de-pointe/)

#### 5. **Attributs Autocomplete des Formulaires - RGAA 11.13 [AA]**

- [ ] **Champs nom d'utilisateur** : `autocomplete="username"`
- [ ] **Champs mot de passe** : `autocomplete="current-password"` ou `autocomplete="new-password"`
- [ ] **Prénom** : `autocomplete="given-name"`
- [ ] **Nom de famille** : `autocomplete="family-name"`
- [ ] **Email** : `autocomplete="email"`

#### 6. **Accessibilité du Menu Mobile**

- [ ] **Bouton de menu À L'INTÉRIEUR de l'élément `<nav>`**
- [ ] **État du menu communiqué** : `aria-expanded="false/true"`
- [ ] **Texte explicite** : "Menu principal" (pas seulement "Menu")

```html
<nav role="navigation" aria-label="Navigation principale">
  <button aria-expanded="false" aria-controls="menu-items">
    Menu principal
  </button>
  <ul id="menu-items">
    ...
  </ul>
</nav>
```

#### 7. **Deux Moyens de Navigation - RGAA 12.1 [AA]**

- [ ] **Choisir DEUX parmi** :
  - **Menu de navigation principal**
  - **Plan du site** (structure complète du site)
  - **Moteur de recherche** (doit indexer TOUT le contenu)
  - **Fil d'Ariane** (chemin hiérarchique : Accueil > Section > Page Courante)

#### 8. **Langue du Document - RGAA 8.3-8.4 [A]**

- [ ] **Langue principale déclarée sur `<html lang="fr">` ou `<html lang="en">`**
- [ ] **Changements de langue marqués** : `<span lang="en">Texte anglais</span>`
- [ ] **Codes de langue ISO 639 valides**

#### 9. **Éléments Interactifs Complexes**

- [ ] **Tous les iframe avec `title` descriptif**
- [ ] **Tableaux de données avec `<caption>` ou `aria-label`**
- [ ] **En-têtes de tableau avec `<th>` et `scope="col/row"`**

### 🧪 Protocole de Test Manuel

#### Test 1 : Vérification du Lien d'Évitement

1. Tab au premier chargement de page → le lien d'évitement doit apparaître
2. Appuyer sur Entrée sur le lien d'évitement → le focus se déplace vers `<main>`
3. Vérifier que `<main>` a `tabindex="-1"`

#### Test 2 : Mises à Jour des Titres SPA

1. Naviguer entre les pages
2. Vérifier que `document.title` change pour chaque route
3. Vérifier la cohérence du format

#### Test 3 : Validation de Formulaire

1. Soumettre un formulaire vide
2. Vérifier que le focus se déplace vers le premier champ en erreur
3. Vérifier `aria-describedby` sur les champs en erreur
4. Vérifier les attributs autocomplete

##### Test 3a : Tests Spécifiques du Formulaire SignIn

**URL** : `/signin`

1. **Soumission de Formulaire Vide** :
   - Laisser les champs email et mot de passe vides
   - Cliquer sur le bouton "Connect"
   - **Attendu** : Message d'erreur apparaît avec `role="alert"`
   - **Attendu** : Le focus doit se déplacer vers le premier champ en erreur (champ email)
2. **Test Email Invalide** :
   - Saisir un email invalide (ex. : "invalid-email")
   - Saisir un mot de passe valide
   - Soumettre le formulaire
   - **Attendu** : Le focus se déplace vers le champ email
   - **Attendu** : Le champ email a `aria-invalid="true"`
   - **Attendu** : Le champ email a `aria-describedby="error-message"`
3. **Test Identifiants Invalides** :
   - Saisir un email au format valide mais des identifiants incorrects
   - Soumettre le formulaire
   - **Attendu** : Message d'erreur général apparaît
   - **Attendu** : Le comportement du focus doit guider l'utilisateur vers la correction
4. **Vérification Autocomplete** :
   - Champ email : `autocomplete="username"`
   - Champ mot de passe : `autocomplete="current-password"`

#### Test 4 : Test avec Lecteur d'Écran

1. Naviguer avec un lecteur d'écran (NVDA recommandé)
2. Tester la navigation par landmarks
3. Vérifier que tous les éléments interactifs sont annoncés
4. Tester le flux de completion de formulaire

### 📚 Ressources de Référence

- [RGAA 4.1 Critères et Tests](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/)
- [Matériel de Formation Access42](A11y_Ressources/developpeur-master/formation/)
- [Référence Rapide WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

---

## ✅ Implementation Status | État d'Implémentation

### ArgentBank Project Status | Statut du Projet ArgentBank

- ✅ Skip links implemented | Liens d'évitement implémentés
- ✅ Unique ARIA landmarks | Landmarks ARIA uniques
- ✅ Dynamic page titles | Titres de pages dynamiques
- ✅ Proper screen reader classes | Classes lecteurs d'écran appropriées
- ✅ Form autocomplete attributes | Attributs autocomplete des formulaires
- ✅ Mobile menu accessibility | Accessibilité du menu mobile
- ✅ Two navigation methods | Deux moyens de navigation
- ✅ Document language declared | Langue du document déclarée

### Quick Verification Checklist | Liste de Vérification Rapide

1. **Skip link** : Tab → see "Skip to content" first | Tab → voir "Aller au contenu" en premier
2. **Page titles** : Navigate → title changes in browser tab | Naviguer → titre change dans l'onglet
3. **Autocomplete** : Form fields have appropriate attributes | Les champs ont les bons attributs
4. **Landmarks** : Use Axe extension "Landmarks" tab | Utiliser l'extension Axe onglet "Landmarks"

---

**Last Updated | Dernière Mise à Jour** : 16 juillet 2025
