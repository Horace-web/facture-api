<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

<h1 align="center">facture-api</h1>

<p align="center">
  Un module de génération de facture PDF pour un paiement — construit avec <a href="https://nestjs.com">NestJS</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-v10-red?logo=nestjs" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/PDFKit-0.15-orange" />
  <img src="https://img.shields.io/badge/TypeORM-MySQL-4479A1?logo=mysql" />
</p>

---

## 📋 Description

**facture-api** est une API REST développée avec NestJS permettant de générer des factures PDF pour des paiements. Inspiré du système de facturation de [FeexPay](https://feexpay.me), chaque facture générée contient les informations du client, le détail des articles, les frais de transaction, la méthode de paiement et un total récapitulatif — le tout mis en page dans un PDF professionnel.

---

## ✨ Fonctionnalités

- ✅ Création de facture avec calcul automatique du total
- ✅ Génération automatique du PDF à la création
- ✅ Sauvegarde du PDF sur disque
- ✅ Affichage du PDF directement dans le navigateur
- ✅ Mise en page professionnelle : en-tête orange, tableau des articles, footer
- ✅ Référence unique générée automatiquement

---

## 🚀 Installation

```bash
git clone https://github.com/Horace-web/facture-api.git
cd facture-api
npm install
```

---

## ⚙️ Configuration

La base de données est configurée directement dans `app.module.ts` via TypeORM (exemple) :

```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'facture_db',
  autoLoadEntities: true,
  synchronize: true,
}),
```

> ⚠️ Assure-toi d'avoir créé la base de données MySQL `facture_db` avant de démarrer le serveur. Avec `synchronize: true`, les tables seront créées automatiquement au démarrage.

---

## ▶️ Démarrage

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod
```

L'API sera disponible sur `http://localhost:3000`

---

## 📦 Endpoints

### Créer une facture
```http
POST /factures
Content-Type: application/json

{
  "clientName": "Horace OAO",
  "clientEmail": "HoraceOAO@gmail.com",
  "clientPhone": "2290144558822",
  "paymentMethod": "Cartes bancaires",
  "transactionFee": 17,
  "items": [
    {
      "description": "Montant de l'opération",
      "quantity": 1,
      "unitPrice": 1000
    }
  ]
}
```

### Lister toutes les factures
```http
GET /factures
```

### Détail d'une facture
```http
GET /factures/:reference
```

### Afficher le PDF dans le navigateur
```http
GET /factures/:reference/pdf
```

---

## 🧾 Aperçu du PDF généré

Le PDF généré contient :

| Section | Contenu |
|---|---|
| **En-tête** | Nom du shop, email, téléphone |
| **Tableau client** | Nom, email, téléphone + date de paiement |
| **Tableau articles** | Désignations, quantité, prix unitaire, montant (fond orange) |
| **Frais de transaction** | Montant des frais |
| **Méthode de paiement** | Ex : Cartes bancaires |
| **Total payé** | Somme finale |
| **Footer** | Message de sécurité et contact FeexPay |

---

## 🏗️ Structure du projet

```
src/
├── factures/
│   ├── facture.entity/
│   │   └── facture.entity.ts
│   ├── facture-item.entity/
│   │   └── facture-item.entity.ts
│   ├── factures.controller.ts
│   ├── factures.service.ts
│   └── factures.module.ts
├── app.module.ts
└── main.ts
pdfs/                  # Dossier des PDFs générés (auto-créé)
```

---

## 🛠️ Technologies utilisées

- [NestJS](https://nestjs.com) — Framework backend
- [TypeORM](https://typeorm.io) — ORM pour MySQL
- [PDFKit](http://pdfkit.org) — Génération de PDF
- [MySQL](https://www.mysql.com) — Base de données

---

## 👤 Auteur

**Horace-web** — [GitHub](https://github.com/Horace-web)

---

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).
