# My React App

Ce projet est une application React qui simule des utilisateurs et leurs comptes à l'aide de données mockées.

## Structure du projet

- **src/data/mockData.ts** : Contient des données mockées pour simuler des utilisateurs et leurs comptes.
- **src/models/User.ts** : Définit une classe `User` représentant un utilisateur avec des propriétés comme `id`, `firstName`, `lastName`, `userName`, et `email`.
- **src/services/userService.ts** : Exporte une fonction `getUsers` pour récupérer les données mockées et d'autres fonctions pour gérer les utilisateurs.
- **src/components/User/index.tsx** : Composant React `User` qui affiche les informations d'un utilisateur.
- **src/App.tsx** : Point d'entrée de l'application, importe le composant `User` et utilise `getUsers` pour afficher les utilisateurs.

## Installation

1. Clonez le dépôt.
2. Exécutez `npm install` pour installer les dépendances.
3. Exécutez `npm start` pour démarrer l'application.

## Contribuer

Les contributions sont les bienvenues ! Veuillez soumettre une demande de tirage pour toute amélioration ou correction.