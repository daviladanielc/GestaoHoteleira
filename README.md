# ERP Hotel — Painel de Governança & Recepção (Front Web)

Aplicação web full-stack desenvolvida para simular os fluxos operacionais essenciais de um sistema de gestão hoteleira (PMS), incluindo mapa interativo de Unidades Habitacionais (UHs), controle de ocupação, cadastros base e check-in com vínculo Mestre-Detalhe de hóspedes.

## Funcionalidades

- **Mapa de UHs em Tempo Real:** Visualização dinâmica das unidades habitacionais por status (`LIVRE`, `OCUPADA`, `MANUTENÇÃO`), indicadores consolidados no cabeçalho e cálculo automático da diária total (tarifa base + adicionais de pensão por hóspede).
- **Check-in & Vínculo de Hóspedes (Mestre-Detalhe):** Formulário dinâmico para vinculação de titular e acompanhantes respeitando a capacidade máxima da UH, validação de CPF, regime de pensão individual e regra de titular único.
- **Cadastros Base Relacionais:** Gestão de regimes de pensão, tarifas diárias, categorias de UH e unidades habitacionais com persistência relacional.
- **API & Persistência Local:** Backend HTTP construído com módulos nativos do Node.js e banco de dados relacional SQLite (`hotel.db`) com chaves estrangeiras e transações atômicas.

## Tecnologias Utilizadas

### Frontend
- **React 19 + TypeScript + Vite:** Base da aplicação SPA com tipagem estática.
- **Tailwind CSS + `clsx` + `tailwind-merge`:** Estilização utilitária e composição dinâmica de classes visuais.
- **React Router (`react-router-dom`):** Roteamento client-side entre Mapa de UHs, Ficha/Check-in e Cadastros.
- **Zustand:** Gerenciamento de estado global leve para sessão do operador e filtros de interface.
- **TanStack Query (`@tanstack/react-query`) + Axios:** Comunicação HTTP, cache de consultas e invalidação automática após mutações.
- **React Hook Form + Zod (`@hookform/resolvers`):** Formulários performáticos (`useFieldArray`) e validação de schemas em tempo de execução.
- **Sonner:** Notificações flutuantes (*toasts*) para feedback visual das operações.
- **ESLint + Prettier:** Padronização de código, formatação automática e fiscalização das regras dos Hooks.

### Backend
- **Node.js (`node:http` & `node:sqlite`):** Servidor REST nativo e banco de dados SQLite embarcado sem dependências externas.

## Estrutura do Projeto

```text
├── server.mjs               # Servidor REST Node.js e schema/seed do banco SQLite (hotel.db)
└── src/
    ├── components/          # Componentes reutilizáveis (Header, CardUH, FormularioVinculoHospedes, Button)
    ├── hooks/               # Custom Hooks encapsulando Queries e Mutations do TanStack Query
    ├── lib/                 # Instância do Axios (api.ts) e utilitário de classes CSS (utils.ts)
    ├── pages/               # Páginas principais da aplicação (MapaUHs, DetalheUH, Cadastros)
    ├── schemas/             # Schemas de validação e tipos inferidos com Zod
    ├── store/               # Store global com Zustand e interfaces de domínio
    └── App.tsx              # Configuração de Providers e rotas da aplicação
