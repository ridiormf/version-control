/**
 * Internationalization (i18n) system using i18next
 * Detects system language and provides translations
 * Supported languages: English (default), Portuguese, Spanish, French
 * Can be manually configured via config file
 */

import i18next from "i18next";
import { getConfiguredLanguage, hasConfiguredLanguage } from "./config";

export type Language = "en" | "pt" | "es" | "fr";

/**
 * Detect system language from environment variables
 * @returns Detected language code or 'en' as default
 */
function detectLanguage(): Language {
  const langEnv =
    process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || "";
  const langCode = langEnv.toLowerCase().substring(0, 2);

  if (langCode === "pt" || langCode === "es" || langCode === "fr") {
    return langCode as Language;
  }

  return "en";
}

/**
 * Get current language (config first, then system detection)
 * @returns Current language code
 */
function getCurrentLanguage(): Language {
  const configuredLang = getConfiguredLanguage();
  if (configuredLang) {
    return configuredLang;
  }
  return detectLanguage();
}

// Initialize i18next synchronously
i18next.init({
  lng: getCurrentLanguage(),
  fallbackLng: "en",
  initImmediate: false, // Force synchronous initialization
  resources: {
    en: {
      translation: {
        // Main CLI
        versionControl: "Version Control System",
        currentVersion: "Current version:",
        analyzingCommit: "Analyzing last commit...",
        commitMessage: "Commit message:",
        filesModified: "Files modified:",
        andMore: "and",
        changeAnalysis: "Change analysis:",
        suggestedType: "Suggested type:",
        newVersion: "New version:",
        updateVersion: "Update version? (y/n):",
        versionNotChanged: "Version not changed.",
        confirmVersionType: "Confirm version type:",
        majorDesc: "Breaking changes",
        minorDesc: "New feature",
        patchDesc: "Bug fix",
        choose: "Choose",
        defaultLabel: "default",
        invalidOption: "Invalid option. Enter 1, 2, or 3",
        pleaseEnterYesNo: "Please enter 'y' or 'n'",
        invalidResponse: "Invalid response. Enter 'y' for yes or 'n' for no",
        updatingFiles: "Updating files...",
        versionUpdatedTo: "Version updated to",
        error: "Error:",
        noCommitFound: "No commit found. Make a commit first.",

        // Analyzer
        breakingChange: "🔴 Commit indicates BREAKING change or functionality removal",
        configFilesModified: "🟡 Configuration files modified",
        newFeatureIndicated: "🟡 Commit indicates new feature",
        newFilesAdded: "new file(s) added",
        bugFixIndicated: "🟢 Commit indicates bug fix",
        smallChange: "🟢 Small change/adjustment",

        // Updater
        packageJsonUpdated: "package.json updated",
        updated: "updated",
        changelogNotFound: "CHANGELOG.md not found",
        noNewCommits: "No new commits found",
        changelogUpdated: "CHANGELOG.md updated with",
        commits: "commit(s)",
        initialRelease: "Initial Release",
        firstPublicVersion: "First public release of the project.",

        // Git Commands
        executingGitCommands: "Executing git commands...",
        filesAdded: "Files added",
        commitCreated: "Commit created",
        tagCreated: "Tag created",
        pushCompleted: "Push completed",
        tagsPushed: "Tags pushed",
        versionPublished: "Version published successfully!",
        errorExecutingGit: "Error executing git commands:",
        executeManually: "Execute manually:",

        // Smart Commit
        smartCommit: "Smart Commit - Auto Message",
        noStagedFiles: "No staged files found.",
        howToUse: "How to use:",
        makeChanges: "Make your changes",
        stageFiles: "Stage files:",
        runCommand: "Run:",
        stagedFiles: "Staged files:",
        andMoreFiles: "and more file(s)",
        analyzingChanges: "Analyzing changes...",
        generatedMessage: "Generated commit message:",
        details: "Details:",
        type: "Type:",
        scope: "Scope:",
        description: "Description:",
        options: "Options:",
        optionCommit: "Commit",
        optionEdit: "Edit",
        optionCancel: "Cancel",
        choice: "Choice:",
        invalidEnter: "Invalid. Enter 1, 2, or 3",
        enterCommitMessage: "Enter your commit message:",
        emptyMessage: "Empty message. Commit cancelled.",
        commitCancelled: "Commit cancelled.",
        committing: "Committing...",
        commitSuccess: "Commit created successfully!",
        commitFailed: "Failed to create commit",

        // Language Configuration
        languageConfigured: "Language configured:",
        languageDetected: "Language detected:",
        toChangeLanguage: "To change language:",
        availableLanguages: "Available languages: en, pt, es, fr",
        languageSet: "Language set to",
        languageCleared: "Language configuration cleared. Using system default.",
        invalidLanguage: "Invalid language. Available: en, pt, es, fr",
        currentLanguageIs: "Current language:",
        configuredManually: "manually configured",
        detectedFromSystem: "detected from system",

        // Response options
        yes: "y",
        no: "n",
        yesOptions: "y,yes",
        noOptions: "n,no",
      },
    },
    pt: {
      translation: {
        // Main CLI
        versionControl: "Sistema de Controle de Versão",
        currentVersion: "Versão atual:",
        analyzingCommit: "Analisando último commit...",
        commitMessage: "Mensagem do commit:",
        filesModified: "Arquivos modificados:",
        andMore: "e mais",
        changeAnalysis: "Análise da mudança:",
        suggestedType: "Tipo sugerido:",
        newVersion: "Nova versão:",
        updateVersion: "Deseja atualizar a versão? (s/n):",
        versionNotChanged: "Versão não alterada.",
        confirmVersionType: "Confirme o tipo de versão:",
        majorDesc: "Breaking changes",
        minorDesc: "Nova funcionalidade",
        patchDesc: "Correção de bug",
        choose: "Escolha",
        defaultLabel: "padrão",
        invalidOption: "Opção inválida. Digite 1, 2 ou 3",
        pleaseEnterYesNo: "Por favor, digite 's' ou 'n'",
        invalidResponse: "Resposta inválida. Digite 's' para sim ou 'n' para não",
        updatingFiles: "Atualizando arquivos...",
        versionUpdatedTo: "Versão atualizada para",
        error: "Erro:",
        noCommitFound: "Nenhum commit encontrado. Faça um commit primeiro.",

        // Analyzer
        breakingChange: "🔴 Commit indica mudança BREAKING ou remoção de funcionalidade",
        configFilesModified: "🟡 Arquivos de configuração modificados",
        newFeatureIndicated: "🟡 Commit indica nova funcionalidade",
        newFilesAdded: "arquivo(s) novo(s) adicionado(s)",
        bugFixIndicated: "🟢 Commit indica correção de bug",
        smallChange: "🟢 Pequena mudança/ajuste",

        // Updater
        packageJsonUpdated: "package.json atualizado",
        updated: "atualizado",
        changelogNotFound: "CHANGELOG.md não encontrado",
        noNewCommits: "Nenhum commit novo encontrado",
        changelogUpdated: "CHANGELOG.md atualizado com",
        commits: "commit(s)",
        initialRelease: "Lançamento Inicial",
        firstPublicVersion: "Primeira versão pública do projeto.",

        // Git Commands
        executingGitCommands: "Executando comandos git...",
        filesAdded: "Arquivos adicionados",
        commitCreated: "Commit criado",
        tagCreated: "Tag criada",
        pushCompleted: "Push realizado",
        tagsPushed: "Tags enviadas",
        versionPublished: "Versão publicada com sucesso!",
        errorExecutingGit: "Erro ao executar comandos git:",
        executeManually: "Execute manualmente:",

        // Smart Commit
        smartCommit: "Smart Commit - Mensagem Automática",
        noStagedFiles: "Nenhum arquivo em stage encontrado.",
        howToUse: "Como usar:",
        makeChanges: "Faça suas alterações",
        stageFiles: "Adicione ao stage:",
        runCommand: "Execute:",
        stagedFiles: "Arquivos em stage:",
        andMoreFiles: "e mais arquivo(s)",
        analyzingChanges: "Analisando mudanças...",
        generatedMessage: "Mensagem de commit gerada:",
        details: "Detalhes:",
        type: "Tipo:",
        scope: "Escopo:",
        description: "Descrição:",
        options: "Opções:",
        optionCommit: "Commitar",
        optionEdit: "Editar",
        optionCancel: "Cancelar",
        choice: "Escolha:",
        invalidEnter: "Inválido. Digite 1, 2 ou 3",
        enterCommitMessage: "Digite sua mensagem de commit:",
        emptyMessage: "Mensagem vazia. Commit cancelado.",
        commitCancelled: "Commit cancelado.",
        committing: "Commitando...",
        commitSuccess: "Commit criado com sucesso!",
        commitFailed: "Falha ao criar commit",

        // Language Configuration
        languageConfigured: "Idioma configurado:",
        languageDetected: "Idioma detectado:",
        toChangeLanguage: "Para mudar o idioma:",
        availableLanguages: "Idiomas disponíveis: en, pt, es, fr",
        languageSet: "Idioma configurado para",
        languageCleared: "Configuração de idioma removida. Usando padrão do sistema.",
        invalidLanguage: "Idioma inválido. Disponíveis: en, pt, es, fr",
        currentLanguageIs: "Idioma atual:",
        configuredManually: "configurado manualmente",
        detectedFromSystem: "detectado do sistema",

        // Response options
        yes: "s",
        no: "n",
        yesOptions: "s,sim",
        noOptions: "n,não,nao",
      },
    },
    es: {
      translation: {
        // Main CLI
        versionControl: "Sistema de Control de Versiones",
        currentVersion: "Versión actual:",
        analyzingCommit: "Analizando último commit...",
        commitMessage: "Mensaje del commit:",
        filesModified: "Archivos modificados:",
        andMore: "y más",
        changeAnalysis: "Análisis del cambio:",
        suggestedType: "Tipo sugerido:",
        newVersion: "Nueva versión:",
        updateVersion: "¿Actualizar versión? (s/n):",
        versionNotChanged: "Versión no cambiada.",
        confirmVersionType: "Confirme el tipo de versión:",
        majorDesc: "Cambios incompatibles",
        minorDesc: "Nueva funcionalidad",
        patchDesc: "Corrección de errores",
        choose: "Elija",
        defaultLabel: "predeterminado",
        invalidOption: "Opción inválida. Ingrese 1, 2 o 3",
        pleaseEnterYesNo: "Por favor, ingrese 's' o 'n'",
        invalidResponse: "Respuesta inválida. Ingrese 's' para sí o 'n' para no",
        updatingFiles: "Actualizando archivos...",
        versionUpdatedTo: "Versión actualizada a",
        error: "Error:",
        noCommitFound: "No se encontró commit. Haga un commit primero.",

        // Analyzer
        breakingChange: "🔴 Commit indica cambio BREAKING o eliminación de funcionalidad",
        configFilesModified: "🟡 Archivos de configuración modificados",
        newFeatureIndicated: "🟡 Commit indica nueva funcionalidad",
        newFilesAdded: "archivo(s) nuevo(s) agregado(s)",
        bugFixIndicated: "🟢 Commit indica corrección de error",
        smallChange: "🟢 Pequeño cambio/ajuste",

        // Updater
        packageJsonUpdated: "package.json actualizado",
        updated: "actualizado",
        changelogNotFound: "CHANGELOG.md no encontrado",
        noNewCommits: "No se encontraron commits nuevos",
        changelogUpdated: "CHANGELOG.md actualizado con",
        commits: "commit(s)",
        initialRelease: "Lanzamiento Inicial",
        firstPublicVersion: "Primera versión pública del proyecto.",

        // Git Commands
        executingGitCommands: "Ejecutando comandos git...",
        filesAdded: "Archivos agregados",
        commitCreated: "Commit creado",
        tagCreated: "Tag creado",
        pushCompleted: "Push completado",
        tagsPushed: "Tags enviados",
        versionPublished: "¡Versión publicada con éxito!",
        errorExecutingGit: "Error al ejecutar comandos git:",
        executeManually: "Ejecute manualmente:",

        // Smart Commit
        smartCommit: "Smart Commit - Mensaje Automático",
        noStagedFiles: "No se encontraron archivos en stage.",
        howToUse: "Cómo usar:",
        makeChanges: "Haga sus cambios",
        stageFiles: "Agregue al stage:",
        runCommand: "Ejecute:",
        stagedFiles: "Archivos en stage:",
        andMoreFiles: "y más archivo(s)",
        analyzingChanges: "Analizando cambios...",
        generatedMessage: "Mensaje de commit generado:",
        details: "Detalles:",
        type: "Tipo:",
        scope: "Alcance:",
        description: "Descripción:",
        options: "Opciones:",
        optionCommit: "Commitear",
        optionEdit: "Editar",
        optionCancel: "Cancelar",
        choice: "Opción:",
        invalidEnter: "Inválido. Ingrese 1, 2 o 3",
        enterCommitMessage: "Ingrese su mensaje de commit:",
        emptyMessage: "Mensaje vacío. Commit cancelado.",
        commitCancelled: "Commit cancelado.",
        committing: "Commiteando...",
        commitSuccess: "¡Commit creado con éxito!",
        commitFailed: "Error al crear commit",

        // Language Configuration
        languageConfigured: "Idioma configurado:",
        languageDetected: "Idioma detectado:",
        toChangeLanguage: "Para cambiar el idioma:",
        availableLanguages: "Idiomas disponibles: en, pt, es, fr",
        languageSet: "Idioma configurado a",
        languageCleared: "Configuración de idioma eliminada. Usando predeterminado del sistema.",
        invalidLanguage: "Idioma inválido. Disponibles: en, pt, es, fr",
        currentLanguageIs: "Idioma actual:",
        configuredManually: "configurado manualmente",
        detectedFromSystem: "detectado del sistema",

        // Response options
        yes: "s",
        no: "n",
        yesOptions: "s,si,sí",
        noOptions: "n,no",
      },
    },
    fr: {
      translation: {
        // Main CLI
        versionControl: "Système de Contrôle de Version",
        currentVersion: "Version actuelle:",
        analyzingCommit: "Analyse du dernier commit...",
        commitMessage: "Message du commit:",
        filesModified: "Fichiers modifiés:",
        andMore: "et plus",
        changeAnalysis: "Analyse du changement:",
        suggestedType: "Type suggéré:",
        newVersion: "Nouvelle version:",
        updateVersion: "Mettre à jour la version? (o/n):",
        versionNotChanged: "Version non modifiée.",
        confirmVersionType: "Confirmez le type de version:",
        majorDesc: "Changements incompatibles",
        minorDesc: "Nouvelle fonctionnalité",
        patchDesc: "Correction de bug",
        choose: "Choisissez",
        defaultLabel: "par défaut",
        invalidOption: "Option invalide. Entrez 1, 2 ou 3",
        pleaseEnterYesNo: "Veuillez entrer 'o' ou 'n'",
        invalidResponse: "Réponse invalide. Entrez 'o' pour oui ou 'n' pour non",
        updatingFiles: "Mise à jour des fichiers...",
        versionUpdatedTo: "Version mise à jour vers",
        error: "Erreur:",
        noCommitFound: "Aucun commit trouvé. Faites un commit d'abord.",

        // Analyzer
        breakingChange: "🔴 Commit indique un changement BREAKING ou suppression de fonctionnalité",
        configFilesModified: "🟡 Fichiers de configuration modifiés",
        newFeatureIndicated: "🟡 Commit indique une nouvelle fonctionnalité",
        newFilesAdded: "nouveau(x) fichier(s) ajouté(s)",
        bugFixIndicated: "🟢 Commit indique une correction de bug",
        smallChange: "🟢 Petit changement/ajustement",

        // Updater
        packageJsonUpdated: "package.json mis à jour",
        updated: "mis à jour",
        changelogNotFound: "CHANGELOG.md non trouvé",
        noNewCommits: "Aucun nouveau commit trouvé",
        changelogUpdated: "CHANGELOG.md mis à jour avec",
        commits: "commit(s)",
        initialRelease: "Version Initiale",
        firstPublicVersion: "Première version publique du projet.",

        // Git Commands
        executingGitCommands: "Exécution des commandes git...",
        filesAdded: "Fichiers ajoutés",
        commitCreated: "Commit créé",
        tagCreated: "Tag créé",
        pushCompleted: "Push effectué",
        tagsPushed: "Tags envoyés",
        versionPublished: "Version publiée avec succès!",
        errorExecutingGit: "Erreur lors de l'exécution des commandes git:",
        executeManually: "Exécutez manuellement:",

        // Smart Commit
        smartCommit: "Smart Commit - Message Automatique",
        noStagedFiles: "Aucun fichier stagé trouvé.",
        howToUse: "Comment utiliser:",
        makeChanges: "Faites vos modifications",
        stageFiles: "Stagez les fichiers:",
        runCommand: "Exécutez:",
        stagedFiles: "Fichiers stagés:",
        andMoreFiles: "et plus de fichier(s)",
        analyzingChanges: "Analyse des changements...",
        generatedMessage: "Message de commit généré:",
        details: "Détails:",
        type: "Type:",
        scope: "Portée:",
        description: "Description:",
        options: "Options:",
        optionCommit: "Committer",
        optionEdit: "Éditer",
        optionCancel: "Annuler",
        choice: "Choix:",
        invalidEnter: "Invalide. Entrez 1, 2 ou 3",
        enterCommitMessage: "Entrez votre message de commit:",
        emptyMessage: "Message vide. Commit annulé.",
        commitCancelled: "Commit annulé.",
        committing: "Commit en cours...",
        commitSuccess: "Commit créé avec succès!",
        commitFailed: "Échec de la création du commit",

        // Language Configuration
        languageConfigured: "Langue configurée:",
        languageDetected: "Langue détectée:",
        toChangeLanguage: "Pour changer la langue:",
        availableLanguages: "Langues disponibles: en, pt, es, fr",
        languageSet: "Langue configurée à",
        languageCleared: "Configuration de langue supprimée. Utilisation du système par défaut.",
        invalidLanguage: "Langue invalide. Disponibles: en, pt, es, fr",
        currentLanguageIs: "Langue actuelle:",
        configuredManually: "configurée manuellement",
        detectedFromSystem: "détectée du système",

        // Response options
        yes: "o",
        no: "n",
        yesOptions: "o,oui",
        noOptions: "n,non",
      },
    },
  },
});

// Export current language info
export const currentLanguage: Language = getCurrentLanguage();
export const isLanguageConfigured: boolean = hasConfiguredLanguage();

// Helper function to get yes/no options as arrays
export function getYesOptions(): string[] {
  return i18next.t("yesOptions").split(",");
}

export function getNoOptions(): string[] {
  return i18next.t("noOptions").split(",");
}

// Export i18next instance
export default i18next;
export const t = i18next.t.bind(i18next);
