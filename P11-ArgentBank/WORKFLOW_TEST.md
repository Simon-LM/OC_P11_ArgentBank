# 🧪 Test des Workflows CI/CD

Ce fichier sert à tester le bon fonctionnement des workflows GitHub Actions.

## ✅ Workflows configurés :

- `ci-cd.yml` - Pipeline principal avec build, tests et notifications
- `test-email.yml` - Test spécifique des notifications email

## 📧 Configuration email :

- Serveur SMTP : ProtonMail (`mail.protonmail.ch`)
- Destination : `alerts@lostintab.com`
- Authentification : Token SMTP ProtonMail

---

_Fichier créé le : {{ date }}_
