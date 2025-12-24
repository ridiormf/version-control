# Version Control

[![en](https://img.shields.io/badge/lang-en-blue.svg)](README.md)
[![pt](https://img.shields.io/badge/lang-pt-green.svg)](README.pt.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](README.es.md)
[![fr](https://img.shields.io/badge/lang-fr-purple.svg)](README.fr.md)

> Système intelligent de contrôle de version qui analyse les commits Git et automatise le versionnage sémantique (SemVer).

[![npm version](https://img.shields.io/npm/v/@ridio/version-control.svg)](https://www.npmjs.com/package/@ridio/version-control)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table des Matières

- [À propos](#à-propos)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Comment ça marche](#comment-ça-marche)
- [Exemples](#exemples)
- [API](#api)
- [Contribuer](#contribuer)
- [Licence](#licence)

## 🎯 À propos

**Version Control** automatise le versionnage sémantique de votre projet, éliminant le besoin de décider manuellement entre MAJOR, MINOR ou PATCH.

**Pourquoi a-t-il été créé ?**

Le versionnage manuel est sujet aux erreurs et incohérent entre les équipes. Cet outil résout :

- ❌ Oubli de mise à jour de \`package.json\`, \`CHANGELOG.md\` ou des tags
- ❌ Confusion sur la version à utiliser (MAJOR/MINOR/PATCH)
- ❌ CHANGELOGs incomplets ou désorganisés
- ❌ Messages de commit incohérents

**Solution :**

- ✅ Analyse automatiquement les commits et suggère la version correcte
- ✅ Met à jour tous les fichiers en une fois
- ✅ Génère des CHANGELOGs organisés et complets
- ✅ Crée des tags et pousse automatiquement

### ✨ Fonctionnalités

- 🔍 **Analyse Intelligente** : Analyse les messages de commit et les fichiers modifiés
- 🎯 **Suggestion Automatique** : Suggère MAJOR, MINOR ou PATCH selon les changements
- 📝 **Mise à Jour Automatique** : Met à jour \`package.json\`, \`CHANGELOG.md\` et les fichiers de code
- 🏷️ **Git Tags** : Crée automatiquement des tags et pousse vers le dépôt
- 🤖 **Smart Commit** : Génère des messages de commit suivant Conventional Commits
- 📋 **CHANGELOG Intelligent** : Groupe les commits par type et supprime les doublons
- 🧪 **Mode Test** : Permet le rollback automatique
- 🌍 **Internationalisation** : Support pour EN, PT, ES, FR

## 📦 Installation

### Global (Recommandé)

\`\`\`bash
yarn global add @ridiormf/version-control
# ou
npm install -g @ridiormf/version-control
\`\`\`

### Comme dépendance de développement

\`\`\`bash
yarn add -D @ridiormf/version-control
# ou
npm install -D @ridiormf/version-control
\`\`\`

### Utiliser npx (sans installation)

\`\`\`bash
npx @ridiormf/version-control
# ou
yarn dlx @ridiormf/version-control
\`\`\`

## 🚀 Utilisation

### CLI - Contrôle de Version

Après avoir fait vos modifications et committé :

\`\`\`bash
version-control
\`\`\`

Ou avec npx (sans installer) :

\`\`\`bash
npx @ridiormf/version-control
\`\`\`

### CLI - Smart Commit

Commit intelligent avec message automatique :

\`\`\`bash
git add .
smart-commit
\`\`\`

**Exemple :**

\`\`\`bash
Fichiers staged : 2
  ✨ src/newFeature.ts (+45/-0)
  📝 src/index.ts (+5/-2)

Message de commit généré :
feat(src): add newFeature

Options : [1] Commit [2] Éditer [3] Annuler
Choix : 1

✓ Commit créé avec succès !
\`\`\`

### Ajouter à package.json

Ajoutez un script à votre \`package.json\` :

\`\`\`json
{
  "scripts": {
    "version": "version-control",
    "version:test": "version-control --test",
    "commit": "smart-commit"
  }
}
\`\`\`

Et exécutez :

\`\`\`bash
# Smart commit
yarn commit

# Versionnage normal
yarn version

# Versionnage de test (permet le rollback)
yarn version:test
\`\`\`

### Utilisation Programmatique

Utilisez la bibliothèque dans vos scripts personnalisés :

\`\`\`typescript
import {
  analyzeChanges,
  bumpVersion,
  getCurrentVersion,
  updatePackageJson,
  updateChangelog,
  executeGitCommands,
} from "@ridiormf/version-control";

// 1. Obtenir la version actuelle
const currentVersion = getCurrentVersion();
// Retourne : "1.2.3"

// 2. Analyser les changements du dernier commit
const analysis = analyzeChanges();
// Retourne : { type: 'minor', reason: ['Nouvelle fonctionnalité ajoutée'], filesChanged: [...], commitMsg: '...' }

// 3. Calculer la nouvelle version
const newVersion = bumpVersion(currentVersion, analysis.type);
// Retourne : "1.3.0"

// 4. Mettre à jour les fichiers
updatePackageJson(newVersion);
updateChangelog(newVersion, analysis.type, analysis);

// 5. Commit et créer le tag
executeGitCommands(newVersion);
\`\`\`

## 🔧 Comment ça marche

Le système analyse les changements depuis le dernier commit Git et suggère la version appropriée basée sur le format Conventional Commits et les changements de fichiers.

### 🔴 MAJOR (X.0.0) - Changements Incompatibles

Détecté quand le message de commit contient des mots-clés comme :

- \`breaking\`, \`break\`, \`incompatible\`, \`remove\`, \`delete\`, \`rewrite\`

**Exemple :**

\`\`\`bash
git commit -m "breaking: remove deprecated API methods"
# Suggère : 1.5.3 → 2.0.0
\`\`\`

### 🟡 MINOR (x.Y.0) - Nouvelles Fonctionnalités

Détecté quand :

- Le message contient : \`add\`, \`new\`, \`feature\`, \`implement\`, \`create\`
- De nouveaux fichiers sont ajoutés au projet
- Les fichiers de configuration sont modifiés

**Exemple :**

\`\`\`bash
git commit -m "feat: add user authentication module"
# Suggère : 1.5.3 → 1.6.0
\`\`\`

### 🟢 PATCH (x.y.Z) - Corrections

Détecté quand le message contient :

- \`fix\`, \`bug\`, \`error\`
- Petits changements sans nouveaux fichiers

**Exemple :**

\`\`\`bash
git commit -m "fix: resolve memory leak in cache"
# Suggère : 1.5.3 → 1.5.4
\`\`\`

### 📊 Versionnage Sémantique

\`\`\`
Casse le code existant ?
├─ OUI → 🔴 MAJOR (X.0.0)
└─ NON → Ajoute des fonctionnalités ?
         ├─ OUI → 🟡 MINOR (x.Y.0)
         └─ NON → 🟢 PATCH (x.y.Z)
\`\`\`

Voir plus sur [semver.org](https://semver.org/)

## 📖 Exemples

### Flux Typique

\`\`\`bash
git commit -m "feat: add new export functionality"
version-control

# Version actuelle : 1.2.3
# Type suggéré : MINOR
# Nouvelle version : 1.3.0
#
# Mettre à jour la version ? (y/n) : y
#
# ✓ package.json mis à jour
# ✓ CHANGELOG.md mis à jour
# ✓ Tag v1.3.0 créé
# ✓ Version 1.3.0 publiée !
\`\`\`

## 📚 API

### Méthodes Disponibles

#### Analyse et Versionnage

- \`analyzeChanges()\` - Analyse le dernier commit et suggère le type de version
- \`getCurrentVersion(projectRoot?)\` - Retourne la version actuelle depuis package.json
- \`bumpVersion(currentVersion, type)\` - Calcule la nouvelle version

#### Mise à Jour des Fichiers

- \`updatePackageJson(newVersion, projectRoot?)\` - Met à jour package.json
- \`updateIndexFile(newVersion, projectRoot?)\` - Met à jour @version dans les fichiers de code
- \`updateChangelog(version, type, analysis, projectRoot?)\` - Met à jour CHANGELOG.md

#### Commit et Git

- \`executeGitCommands(version)\` - Crée commit, tag et pousse
- \`getStagedChanges()\` - Liste les fichiers staged
- \`generateCommitMessage(changes)\` - Génère un message de commit automatique

#### Configuration

- \`getConfiguredLanguage()\` - Retourne la langue configurée
- \`setLanguage(lang)\` - Définit la langue manuellement
- \`clearConfig()\` - Supprime la configuration

---

### Détails

#### \`analyzeChanges(): ChangeAnalysis\`

Analyse le dernier commit et retourne une analyse des changements.

**Retourne :**

\`\`\`typescript
interface ChangeAnalysis {
  type: "major" | "minor" | "patch";
  reason: string[];
  filesChanged: string[];
  commitMsg: string;
}
\`\`\`

#### \`getCurrentVersion(projectRoot?: string): string\`

Retourne la version actuelle depuis \`package.json\`.

**Paramètres :**

- \`projectRoot\` (optionnel) : Chemin racine du projet (par défaut : \`process.cwd()\`)

#### \`bumpVersion(currentVersion: string, type: VersionType): string\`

Calcule la nouvelle version basée sur le type de bump.

**Paramètres :**

- \`currentVersion\` : Version actuelle (ex., "1.2.3")
- \`type\` : Type de bump (\`'major'\`, \`'minor'\`, ou \`'patch'\`)

**Exemple :**

\`\`\`typescript
bumpVersion("1.2.3", "major"); // "2.0.0"
bumpVersion("1.2.3", "minor"); // "1.3.0"
bumpVersion("1.2.3", "patch"); // "1.2.4"
\`\`\`

## 🌍 Internationalisation

L'outil détecte automatiquement la langue du système et ajuste tous les messages en conséquence.

### Langues Supportées

- 🇬🇧 **Anglais (EN)** - Par défaut
- 🇧🇷 **Portugais (PT)** - pt_BR, pt_PT
- 🇪🇸 **Espagnol (ES)** - es_ES, es_MX, etc.
- 🇫🇷 **Français (FR)** - fr_FR, fr_CA, etc.

### Configuration Manuelle de la Langue

\`\`\`bash
# Configurer en Portugais
version-control config --lang pt

# Configurer en Anglais
version-control config --lang en

# Configurer en Espagnol
version-control config --lang es

# Configurer en Français
version-control config --lang fr

# Effacer la configuration (retour à la détection automatique)
version-control config --clear

# Voir la configuration actuelle
version-control config
\`\`\`

La configuration est sauvegardée globalement dans \`~/.version-control-config.json\` et sera utilisée dans tous les projets.

## 🎯 Mots-Clés

- **MAJOR** : \`breaking\`, \`remove\`, \`delete\`, \`rewrite\`
- **MINOR** : \`add\`, \`new\`, \`feature\`, \`implement\`
- **PATCH** : \`fix\`, \`bug\`, \`error\`

## 🤝 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Forker le projet
2. Créer une branche pour votre fonctionnalité (\`git checkout -b feature/AmazingFeature\`)
3. Committer vos changements (\`git commit -m 'feat: add some AmazingFeature'\`)
4. Pousser vers la branche (\`git push origin feature/AmazingFeature\`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👤 Auteur

**Ridio Ricardo**

- GitHub : [@ridioricardo](https://github.com/ridioricardo)

---

Basé sur les spécifications de [Semantic Versioning 2.0.0](https://semver.org/)
