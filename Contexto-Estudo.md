# Contexto de Estudo: React + TypeScript para Desenvolvedor Delphi

## 1. Perfil do Desenvolvedor & Estilo de Mentoria
- **Background:** Desenvolvedor Delphi/Object Pascal experiente (VCL, FireDAC, arquitetura multi-camadas, regras de negócio de ERP hoteleiro).
- **Regra de Ouro da Mentoria (Modo Exercício):** NÃO entregue código pronto, arquivos completos ou trechos prontos para copiar e colar nas próximas etapas, **a menos que o usuário peça explicitamente**. Atue apenas como Arquiteto/PO: apresente os requisitos funcionais por etapa, revise os arquivos que o usuário escrever no workspace, aponte bugs/melhorias e libere a próxima etapa quando a atual estiver concluída.

## 2. Stack Utilizada no Projeto (`hotel-front`)
- **Frontend:** React + TypeScript + Vite
- **Estilização:** Tailwind CSS + `clsx` + `tailwind-merge` (helper `cn()` em `src/lib/utils.ts`)
- **Roteamento:** `react-router-dom`
- **Estado Global (UI):** `zustand` (`src/store/useHotelStore.ts`)
- **Estado Assíncrono & HTTP:** `axios` (`src/lib/api.ts`) + `@tanstack/react-query` (`src/hooks/useHotelQueries.ts`)
- **Formulários, Validação & Feedback:** `react-hook-form` + `zod` (`src/schemas/hotelSchemas.ts`) + `@hookform/resolvers` + `sonner`
- **Qualidade:** ESLint 9 + Prettier + `eslint-config-prettier` + `eslint-plugin-react-hooks`
- **Backend & Banco Local:** Servidor HTTP nativo Node.js (`server.mjs` na porta `3333`) + banco relacional nativo `node:sqlite` (`hotel.db`).

## 3. O que já foi construído no Workspace
- Tabelas SQLite já existentes em `server.mjs`: `pensoes`, `tarifas`, `categorias_uh`, `uhs` e `hospedes`.
- Rotas já implementadas:
  - `/` (`PaginaMapaUHs.tsx`): Mapa de UHs com filtros por status e ações rápidas.
  - `/uh/:numeroUH` (`PaginaDetalheUH.tsx` + `FormularioVinculoHospedes.tsx`): Check-in Mestre-Detalhe vinculando titular e acompanhantes com validação de capacidade e titular único via Zod.
  - `/cadastros` (`PaginaCadastros.tsx`): Cadastro de Pensão, Tarifa, Categoria de UH e UH.

---

## 4. Exercício Atual em Andamento: Tela de Fechamento de Conta (Checkout)

O objetivo é implementar o fluxo completo de encerramento de hospedagem em **3 etapas sequenciais**. O usuário está atualmente na **Etapa 1**.

### Etapa 1: Banco de Dados e Backend (`server.mjs`) — [EM ANDAMENTO]
1. **Tabela `lancamentos_caixa`:** Criar no DDL inicial do `server.mjs` contendo: `id` (PK autoincrement), `numeroUH`, `nomeTitular`, `qtdeDiarias`, `qtdePessoas`, `valorTotal`, `formaPagamento` (`PIX`, `CREDITO`, `DEBITO`, `DINHEIRO`) e `dataHora`.
2. **Endpoint `POST /uhs/:numeroUH/checkout`:**
   - Receber no body: `qtdeDiarias`, `formaPagamento` e `valorTotal`.
   - Localizar o hóspede `titular` da UH antes de limpar os dados.
   - Executar dentro de uma transação (`BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`): inserir o registro em `lancamentos_caixa`, deletar os hóspedes vinculados à UH (`DELETE FROM hospedes`) e atualizar a UH para `status = 'LIVRE'` e `qtdePessoas = 0`.
3. **Endpoint `GET /caixa`:** Retornar os lançamentos gravados ordenados do mais recente para o mais antigo.

### Etapa 2: Camada de API, Schemas Zod e Rota no Frontend — [AGUARDANDO ETAPA 1]
1. Criar o schema Zod de validação do fechamento (`qtdeDiarias >= 1`, `formaPagamento` obrigatória dentro das opções permitidas) e a tipagem do lançamento de caixa.
2. Criar as funções de chamada Axios em `src/lib/api.ts` (`realizarCheckout` e `buscarLancamentosCaixa`) e os respectivos Custom Hooks em `src/hooks/useHotelQueries.ts` invalidando o cache de `['uhs']` e `['caixa']`.
3. Configurar a nova rota `/checkout/:numeroUH` no `App.tsx` e ajustar o botão de liberar/checkout no `CardUH.tsx` para navegar até essa tela quando a UH estiver `OCUPADA`.

### Etapa 3: Interface de Fechamento e Extrato (`PaginaCheckout.tsx`) — [AGUARDANDO ETAPA 2]
1. Exibir o resumo da hospedagem: número/categoria da UH, tarifa aplicada, lista de hóspedes vinculados (destacando o titular) e o valor da diária total (`valorBaseDiaria` + soma dos adicionais de pensão).
2. Permitir informar a quantidade de diárias (recalculando o valor total dinamicamente na tela) e a opção de exibir a divisão do valor por hóspede (`valorTotal / qtdePessoas`).
3. Submeter o formulário validado, exibir toast de confirmação via `sonner`, redirecionar para o Mapa de UHs (`/`) e listar o histórico recente de lançamentos do caixa.