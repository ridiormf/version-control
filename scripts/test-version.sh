#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}${CYAN}          Modo de Teste - Version Control${RESET}"
echo -e "${BOLD}${CYAN}════════════════════════════════════════════════════${RESET}"
echo ""

# Salva o estado atual
CURRENT_COMMIT=$(git rev-parse HEAD)
CURRENT_BRANCH=$(git branch --show-current)

echo -e "${YELLOW}📸 Estado atual salvo:${RESET}"
echo -e "   Branch: ${CYAN}${CURRENT_BRANCH}${RESET}"
echo -e "   Commit: ${CYAN}${CURRENT_COMMIT:0:8}${RESET}"
echo ""

# Verifica se há mudanças não commitadas
if [[ -n $(git status -s) ]]; then
  echo -e "${RED}⚠ Aviso: Há mudanças não commitadas no repositório${RESET}"
  echo -e "${YELLOW}   Faça stash ou commit antes de continuar${RESET}"
  echo ""
  exit 1
fi

echo -e "${BOLD}Executando version control...${RESET}"
echo ""
echo "─────────────────────────────────────────────────────"
echo ""

# Executa a ferramenta
node bin/version-control.js

# Captura o código de saída
EXIT_CODE=$?

echo ""
echo "─────────────────────────────────────────────────────"
echo ""

# Se a ferramenta falhou ou foi cancelada, não precisa fazer rollback
if [ $EXIT_CODE -ne 0 ]; then
  echo -e "${YELLOW}⚠ Processo cancelado ou erro ocorreu${RESET}"
  exit $EXIT_CODE
fi

# Verifica se houve mudanças (novo commit e tag)
NEW_COMMIT=$(git rev-parse HEAD 2>/dev/null)
NEW_TAG=$(git describe --tags --exact-match HEAD 2>/dev/null)

if [[ "$NEW_COMMIT" == "$CURRENT_COMMIT" ]]; then
  echo -e "${YELLOW}ℹ Nenhuma mudança foi aplicada${RESET}"
  echo ""
  exit 0
fi

# Mostra o que foi alterado
echo -e "${BOLD}${GREEN}✓ Version control executado com sucesso!${RESET}"
echo ""
echo -e "${BOLD}Mudanças aplicadas:${RESET}"
echo -e "   • Novo commit: ${CYAN}${NEW_COMMIT:0:8}${RESET}"
if [[ -n "$NEW_TAG" ]]; then
  echo -e "   • Nova tag: ${CYAN}${NEW_TAG}${RESET}"
fi
echo ""

# Mostra os arquivos modificados no último commit
echo -e "${BOLD}Arquivos modificados:${RESET}"
git diff --name-only HEAD~1 HEAD | sed 's/^/   • /'
echo ""

# Pergunta se quer manter as mudanças
echo -e "${BOLD}${YELLOW}⚠ MODO DE TESTE - Deseja manter estas mudanças?${RESET}"
echo -e "   ${GREEN}s${RESET} - Manter mudanças (commits e tags ficam no repositório)"
echo -e "   ${RED}n${RESET} - Desfazer tudo (volta ao estado anterior)"
echo ""

# Lê a resposta do usuário
while true; do
  read -p "$(echo -e ${BOLD}Sua escolha \(s/n\):${RESET} )" choice
  case "$choice" in
    s|S|sim|SIM|Sim)
      echo ""
      echo -e "${GREEN}${BOLD}✓ Mudanças mantidas!${RESET}"
      echo ""
      echo -e "${YELLOW}Observação:${RESET} As mudanças foram aplicadas localmente."
      echo -e "Se quiser enviar para o remoto, execute:"
      echo -e "   ${CYAN}git push && git push --tags${RESET}"
      echo ""
      exit 0
      ;;
    n|N|não|nao|NAO|NÃO|Não)
      echo ""
      echo -e "${YELLOW}Desfazendo mudanças...${RESET}"
      
      # Remove a tag se foi criada
      if [[ -n "$NEW_TAG" ]]; then
        git tag -d "$NEW_TAG" > /dev/null 2>&1
        echo -e "   ${GREEN}✓${RESET} Tag ${CYAN}${NEW_TAG}${RESET} removida"
      fi
      
      # Volta para o commit anterior
      git reset --hard "$CURRENT_COMMIT" > /dev/null 2>&1
      echo -e "   ${GREEN}✓${RESET} Repositório restaurado para ${CYAN}${CURRENT_COMMIT:0:8}${RESET}"
      
      # Limpa referências
      git gc --prune=now > /dev/null 2>&1
      
      echo ""
      echo -e "${GREEN}${BOLD}✓ Estado anterior restaurado com sucesso!${RESET}"
      echo ""
      exit 0
      ;;
    *)
      echo -e "${RED}Opção inválida. Digite 's' para sim ou 'n' para não${RESET}"
      ;;
  esac
done
