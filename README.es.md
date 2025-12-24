# Version Control

[![en](https://img.shields.io/badge/lang-en-blue.svg)](README.md)
[![pt](https://img.shields.io/badge/lang-pt-green.svg)](README.pt.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](README.es.md)
[![fr](https://img.shields.io/badge/lang-fr-purple.svg)](README.fr.md)

> Sistema inteligente de control de versiones que analiza commits de Git y automatiza el versionado semántico (SemVer).

[![npm version](https://img.shields.io/npm/v/@ridio/version-control.svg)](https://www.npmjs.com/package/@ridio/version-control)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Índice

- [Acerca de](#acerca-de)
- [Instalación](#instalación)
- [Uso](#uso)
- [Cómo funciona](#cómo-funciona)
- [Ejemplos](#ejemplos)
- [API](#api)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

## 🎯 Acerca de

**Version Control** automatiza el versionado semántico de tu proyecto, eliminando la necesidad de decidir manualmente entre MAJOR, MINOR o PATCH.

**¿Por qué fue creado?**

El versionado manual es propenso a errores e inconsistente entre equipos. Esta herramienta resuelve:

- ❌ Olvidar actualizar \`package.json\`, \`CHANGELOG.md\` o tags
- ❌ Confusión sobre qué versión usar (MAJOR/MINOR/PATCH)
- ❌ CHANGELOGs incompletos o desorganizados
- ❌ Mensajes de commit inconsistentes

**Solución:**

- ✅ Analiza automáticamente commits y sugiere la versión correcta
- ✅ Actualiza todos los archivos a la vez
- ✅ Genera CHANGELOGs organizados y completos
- ✅ Crea tags y hace push automáticamente

### ✨ Características

- 🔍 **Análisis Inteligente**: Analiza mensajes de commit y archivos modificados
- 🎯 **Sugerencia Automática**: Sugiere MAJOR, MINOR o PATCH según los cambios
- 📝 **Actualización Automática**: Actualiza \`package.json\`, \`CHANGELOG.md\` y archivos de código
- 🏷️ **Git Tags**: Crea tags automáticamente y hace push al repositorio
- 🤖 **Smart Commit**: Genera mensajes de commit siguiendo Conventional Commits
- 📋 **CHANGELOG Inteligente**: Agrupa commits por tipo y elimina duplicados
- 🧪 **Modo de Prueba**: Permite rollback automático
- 🌍 **Internacionalización**: Soporte para EN, PT, ES, FR

## 📦 Instalación

### Global (Recomendado)

\`\`\`bash
yarn global add @ridiormf/version-control
# o
npm install -g @ridiormf/version-control
\`\`\`

### Como dependencia de desarrollo

\`\`\`bash
yarn add -D @ridiormf/version-control
# o
npm install -D @ridiormf/version-control
\`\`\`

### Usando npx (sin instalación)

\`\`\`bash
npx @ridiormf/version-control
# o
yarn dlx @ridiormf/version-control
\`\`\`

## 🚀 Uso

### CLI - Control de Versiones

Después de hacer tus cambios y commitear:

\`\`\`bash
version-control
\`\`\`

O con npx (sin instalar):

\`\`\`bash
npx @ridiormf/version-control
\`\`\`

### CLI - Smart Commit

Commit inteligente con mensaje automático:

\`\`\`bash
git add .
smart-commit
\`\`\`

**Ejemplo:**

\`\`\`bash
Archivos staged: 2
  ✨ src/newFeature.ts (+45/-0)
  📝 src/index.ts (+5/-2)

Mensaje de commit generado:
feat(src): add newFeature

Opciones: [1] Commit [2] Editar [3] Cancelar
Elección: 1

✓ ¡Commit creado con éxito!
\`\`\`

### Añadir a package.json

Agrega un script a tu \`package.json\`:

\`\`\`json
{
  "scripts": {
    "version": "version-control",
    "version:test": "version-control --test",
    "commit": "smart-commit"
  }
}
\`\`\`

Y ejecuta:

\`\`\`bash
# Smart commit
yarn commit

# Versionado normal
yarn version

# Versionado de prueba (permite rollback)
yarn version:test
\`\`\`

### Uso Programático

Usa la biblioteca en tus scripts personalizados:

\`\`\`typescript
import {
  analyzeChanges,
  bumpVersion,
  getCurrentVersion,
  updatePackageJson,
  updateChangelog,
  executeGitCommands,
} from "@ridiormf/version-control";

// 1. Obtener versión actual
const currentVersion = getCurrentVersion();
// Retorna: "1.2.3"

// 2. Analizar cambios del último commit
const analysis = analyzeChanges();
// Retorna: { type: 'minor', reason: ['Nueva funcionalidad añadida'], filesChanged: [...], commitMsg: '...' }

// 3. Calcular nueva versión
const newVersion = bumpVersion(currentVersion, analysis.type);
// Retorna: "1.3.0"

// 4. Actualizar archivos
updatePackageJson(newVersion);
updateChangelog(newVersion, analysis.type, analysis);

// 5. Commit y crear tag
executeGitCommands(newVersion);
\`\`\`

## 🔧 Cómo funciona

El sistema analiza cambios desde el último commit de Git y sugiere la versión apropiada basándose en el formato Conventional Commits y los cambios de archivos.

### 🔴 MAJOR (X.0.0) - Cambios que Rompen Compatibilidad

Detectado cuando el mensaje de commit contiene palabras clave como:

- \`breaking\`, \`break\`, \`incompatible\`, \`remove\`, \`delete\`, \`rewrite\`

**Ejemplo:**

\`\`\`bash
git commit -m "breaking: remove deprecated API methods"
# Sugiere: 1.5.3 → 2.0.0
\`\`\`

### 🟡 MINOR (x.Y.0) - Nuevas Funcionalidades

Detectado cuando:

- El mensaje contiene: \`add\`, \`new\`, \`feature\`, \`implement\`, \`create\`
- Se añaden nuevos archivos al proyecto
- Se modifican archivos de configuración

**Ejemplo:**

\`\`\`bash
git commit -m "feat: add user authentication module"
# Sugiere: 1.5.3 → 1.6.0
\`\`\`

### 🟢 PATCH (x.y.Z) - Correcciones

Detectado cuando el mensaje contiene:

- \`fix\`, \`bug\`, \`error\`
- Cambios pequeños sin nuevos archivos

**Ejemplo:**

\`\`\`bash
git commit -m "fix: resolve memory leak in cache"
# Sugiere: 1.5.3 → 1.5.4
\`\`\`

### 📊 Versionado Semántico

\`\`\`
¿Rompe código existente?
├─ SÍ → 🔴 MAJOR (X.0.0)
└─ NO → ¿Añade funcionalidad?
         ├─ SÍ → 🟡 MINOR (x.Y.0)
         └─ NO → 🟢 PATCH (x.y.Z)
\`\`\`

Ver más en [semver.org](https://semver.org/)

## 📖 Ejemplos

### Flujo Típico

\`\`\`bash
git commit -m "feat: add new export functionality"
version-control

# Versión actual: 1.2.3
# Tipo sugerido: MINOR
# Nueva versión: 1.3.0
#
# ¿Actualizar versión? (y/n): y
#
# ✓ package.json actualizado
# ✓ CHANGELOG.md actualizado
# ✓ Tag v1.3.0 creado
# ✓ ¡Versión 1.3.0 publicada!
\`\`\`

## 📚 API

### Métodos Disponibles

#### Análisis y Versionado

- \`analyzeChanges()\` - Analiza el último commit y sugiere tipo de versión
- \`getCurrentVersion(projectRoot?)\` - Retorna versión actual desde package.json
- \`bumpVersion(currentVersion, type)\` - Calcula nueva versión

#### Actualización de Archivos

- \`updatePackageJson(newVersion, projectRoot?)\` - Actualiza package.json
- \`updateIndexFile(newVersion, projectRoot?)\` - Actualiza @version en archivos de código
- \`updateChangelog(version, type, analysis, projectRoot?)\` - Actualiza CHANGELOG.md

#### Commit y Git

- \`executeGitCommands(version)\` - Crea commit, tag y hace push
- \`getStagedChanges()\` - Lista archivos staged
- \`generateCommitMessage(changes)\` - Genera mensaje de commit automático

#### Configuración

- \`getConfiguredLanguage()\` - Retorna idioma configurado
- \`setLanguage(lang)\` - Establece idioma manualmente
- \`clearConfig()\` - Elimina configuración

---

### Detalles

#### \`analyzeChanges(): ChangeAnalysis\`

Analiza el último commit y retorna un análisis de los cambios.

**Retorna:**

\`\`\`typescript
interface ChangeAnalysis {
  type: "major" | "minor" | "patch";
  reason: string[];
  filesChanged: string[];
  commitMsg: string;
}
\`\`\`

#### \`getCurrentVersion(projectRoot?: string): string\`

Retorna la versión actual desde \`package.json\`.

**Parámetros:**

- \`projectRoot\` (opcional): Ruta raíz del proyecto (predeterminado: \`process.cwd()\`)

#### \`bumpVersion(currentVersion: string, type: VersionType): string\`

Calcula la nueva versión basada en el tipo de bump.

**Parámetros:**

- \`currentVersion\`: Versión actual (ej., "1.2.3")
- \`type\`: Tipo de bump (\`'major'\`, \`'minor'\`, o \`'patch'\`)

**Ejemplo:**

\`\`\`typescript
bumpVersion("1.2.3", "major"); // "2.0.0"
bumpVersion("1.2.3", "minor"); // "1.3.0"
bumpVersion("1.2.3", "patch"); // "1.2.4"
\`\`\`

## 🌍 Internacionalización

La herramienta detecta automáticamente el idioma del sistema y ajusta todos los mensajes en consecuencia.

### Idiomas Soportados

- 🇬🇧 **Inglés (EN)** - Predeterminado
- 🇧🇷 **Portugués (PT)** - pt_BR, pt_PT
- 🇪🇸 **Español (ES)** - es_ES, es_MX, etc.
- 🇫🇷 **Francés (FR)** - fr_FR, fr_CA, etc.

### Configuración Manual de Idioma

\`\`\`bash
# Configurar a Portugués
version-control config --lang pt

# Configurar a Inglés
version-control config --lang en

# Configurar a Español
version-control config --lang es

# Configurar a Francés
version-control config --lang fr

# Limpiar configuración (volver a detección automática)
version-control config --clear

# Ver configuración actual
version-control config
\`\`\`

La configuración se guarda globalmente en \`~/.version-control-config.json\` y se usará en todos los proyectos.

## 🎯 Palabras Clave

- **MAJOR**: \`breaking\`, \`remove\`, \`delete\`, \`rewrite\`
- **MINOR**: \`add\`, \`new\`, \`feature\`, \`implement\`
- **PATCH**: \`fix\`, \`bug\`, \`error\`

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Siéntete libre de:

1. Hacer fork del proyecto
2. Crear una rama para tu funcionalidad (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'feat: add some AmazingFeature'\`)
4. Hacer push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👤 Autor

**Ridio Ricardo**

- GitHub: [@ridioricardo](https://github.com/ridioricardo)

---

Basado en las especificaciones de [Semantic Versioning 2.0.0](https://semver.org/)
