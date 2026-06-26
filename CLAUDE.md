# CLAUDE.md

Instruções consolidadas do projeto React Template. Fonte: `.cursor/`.

---

## Command: /init

# /init — Inicializa um novo projeto a partir do template

Use este comando em um **chat em modo Agent** logo após clonar o template.

## O que este comando faz

Configure o projeto com nome, descrição, indexação e Open Graph — atualizando `index.html`, `public/robots.txt` e `README.md`.

---

## Regra #1 — UI de seleção do Cursor (obrigatório)

Toda pergunta com opções fixas **DEVE** usar a ferramenta **`AskQuestion`** do Cursor.

O usuário vê o **formulário nativo** (opções clicáveis; teclas `1`, `2`, … selecionam). É essa UX — não texto livre.

### Faça

- Invocar `AskQuestion` **no turno em que for fazer a pergunta**
- Uma chamada pode agrupar várias perguntas no mesmo formulário
- Aguardar a resposta do formulário antes de continuar ou editar arquivos

### Não faça (proibido)

- Pedir "sim ou não", "digite 1 ou 2", "responda com sim/não"
- Listar opções numeradas no chat esperando digitação
- Substituir `AskQuestion` por markdown com bullets de escolha
- Assumir defaults sem o usuário ter selecionado no formulário

### O que fica em texto livre (chat)

Somente entradas que **não** cabem em opções fixas:

- Nome e descrição do projeto (etapa 1)
- URL canônica de produção (se escolheu "Tenho a URL" no formulário)

---

## Fluxo de coleta

### Etapa 1 — Nome e descrição (chat)

Mensagem curta pedindo:

- Nome do projeto
- Descrição curta (1–3 frases)

Aguarde a resposta. **Não** pergunte indexação/OG no mesmo turno.

### Etapa 2 — Indexação e OG (`AskQuestion`)

**Imediatamente** após receber nome e descrição, invoque `AskQuestion` (sem mensagem longa antes):

```json
{
  "title": "Configuração do projeto",
  "questions": [
    {
      "id": "indexacao",
      "prompt": "O projeto será indexado por motores de busca (Google, Bing, etc.)?",
      "options": [
        { "id": "sim", "label": "Sim — site público, landing page ou blog" },
        { "id": "nao", "label": "Não — app interno ou privado" }
      ]
    },
    {
      "id": "open_graph",
      "prompt": "Vai ter Open Graph (preview ao compartilhar o link)?",
      "options": [
        { "id": "sim", "label": "Sim — com imagem de preview (og-image)" },
        { "id": "nao", "label": "Não — preview básico sem imagem dedicada" }
      ]
    }
  ]
}
```

Mapeamento: `option.id` → `sim` ou `nao`.

### Etapa 3 — URL canônica (`AskQuestion`, só se OG = sim)

Se `open_graph` = `sim`, invoque `AskQuestion`:

```json
{
  "title": "Open Graph",
  "questions": [
    {
      "id": "og_url",
      "prompt": "Já tem URL canônica de produção?",
      "options": [
        { "id": "sim", "label": "Sim, tenho a URL" },
        { "id": "nao", "label": "Ainda não — pular por enquanto" }
      ]
    }
  ]
}
```

- `og_url` = `sim` → pedir URL no chat (validar formato)
- `og_url` = `nao` → seguir sem `og:url`

### Etapa 4 — Descrição longa (`AskQuestion`, se necessário)

Se a descrição passar de ~160 caracteres, mostre a versão resumida e invoque `AskQuestion`:

```json
{
  "title": "Meta description",
  "questions": [
    {
      "id": "descricao_meta",
      "prompt": "Usar esta versão resumida nas meta tags?",
      "options": [
        { "id": "sim", "label": "Sim, usar resumida" },
        { "id": "nao", "label": "Não, usar descrição completa" }
      ]
    }
  ]
}
```

---

## Ações após coletar tudo

### 1. `index.html`

- `<title>`, meta description, og/twitter title e description
- **Indexação:** `sim` → `index, follow` · `nao` → manter `noindex, nofollow`
- **OG:** `sim` → og-image, twitter large image, og:url se houver · avisar sobre `public/og-image.png` (1200×630)
- Não alterar `id="app"`, favicon, viewport, charset, script

### 2. `public/robots.txt`

- Indexação `sim` → `Allow: /`
- Indexação `nao` → manter `Disallow: /`

### 3. `README.md`

Reescrever apenas com `# {Nome}` + descrição (sem outras seções).

---

## Confirmação final

Listar: título, indexação, OG (+ URL se houver), lembrete og-image, README.

---

## Regras estritas

- **`AskQuestion` é obrigatório** para indexação, OG, og_url e descricao_meta
- Não rode `yarn install` / `yarn dev`
- Não mexa em `package.json`, `src/`, `.env`, `.cursor/rules/`, `.cursor/docs/`
- Pode editar: `index.html`, `README.md`, `public/robots.txt`
- Não invente respostas — se faltar dado, volte à etapa certa
- Idioma da descrição = idioma do usuário

---

## Exemplo (fluxo correto)

**Usuário:** `/init`

**Você:** _"Me informe o **nome** e a **descrição curta** do projeto."_

**Usuário:** _"Checkout Pro — Plataforma de checkout white-label."_

**Você:** *(invoca `AskQuestion` com indexacao + open_graph — sem pedir sim/não no texto)*

**Usuário:** *(seleciona no formulário do Cursor)*

**Você:** *(se OG=sim, invoca `AskQuestion` og_url; depois edita arquivos)*

## Anti-padrão (nunca faça isso)

```
Para inicializar preciso saber:
1. Vai ser indexado? (sim/não)
2. Vai ter Open Graph? (sim/não)
```

Isso **não** é o select do Cursor. Use `AskQuestion`.

---

## Rule: critical-rules.mdc


Resumo mandatório de runtime e integrações. Detalhes, exemplos e tabelas → `.cursor/docs/DEVELOPMENT_RULES.md`.

## Bootstrap do projeto

- Novo projeto a partir do template → `/init` em chat **modo Agent**
- `/init` configura metadados, indexação e OG — ver `.cursor/commands/init.md`

## Root mounting

- `index.html`: `<div id="app"></div>` · `src/main.tsx`: `document.getElementById("app")`
- Id fixo — **não** troque por `root`, `mfe`, `{nome}-root` ou similar
- Mismatch entre os dois arquivos é blocker

## Validação de parâmetros

- Nunca confie em inputs opcionais (props, URL/query, eventos, payloads de API)
- Guard clauses / early returns antes de consumir valores
- Zod para dados externos — HTTP: `schema.safeParse(data)` + erro descritivo em falha
- UI de estado inválido → `src/shared/components/states/` (crie ali se reutilizável)

## Validação de env

- Toda variável em `src/env.ts` (schema Zod) **antes** de usar
- Acesse via `env` de `@/env` — nunca `import.meta.env` direto
- `App` bloqueia boot com `ErrorLayout` quando `envIsValid === false` — não burle

## HTTP

- Instância `api` de `@lib` — nunca `axios` direto
- Uma função por endpoint em `src/features/{feature}/http/` (ou `src/shared/http/` se reutilizado)
- Tipe parâmetros e retorno · valide resposta com Zod (`safeParse`)

## TanStack Query

- Toda query/mutation em hook `use*` na pasta `hooks/` da feature
- `queryKey` estável e descritivo · `enabled: !!param` para inputs opcionais
- Renomeie retorno com prefixo do recurso (`users`, `isLoadingUsers`, `refetchUsers`)

## Providers

- Novos providers via `ComposeProviders([...])` em `src/app/providers/index.tsx`
- `OuterProviders` (sem Router) vs `InnerProviders` (com Router)
- Cada provider em `src/app/providers/wrappers/` + barrel `wrappers/index.ts`

## Docs de referência

- `.cursor/docs/DEVELOPMENT_RULES.md` — regras detalhadas com exemplos
- `.cursor/docs/COMPONENT_GUIDELINES.md` — estrutura de pastas e anatomia de feature

---

## Rule: component-standards.mdc


Resumo mandatório de arquitetura. Detalhes, exemplos e checklists → `.cursor/docs/COMPONENT_GUIDELINES.md`.

## Estrutura de pastas

- `src/app/` — composição (`index.tsx`, `layouts/`, `providers/`, `router/`, `not-found.tsx`)
- `src/features/{feature}/` — feature self-contained (`index.tsx`, `components/`, `hooks/`, `http/`, `schemas/`)
- `src/shared/` — código compartilhado (`components/ui/`, `hooks/`, `lib/`, `schemas/`, `utils/`)
- `src/assets/`, `src/styles/`, `src/env.ts`, `src/main.tsx`

Referência canônica de feature: `src/features/users/`.

## Path aliases

Use sempre aliases — nunca `../../../`:

| Alias | Caminho |
| ----- | ------- |
| `@/` | `src/` |
| `@components` | `src/shared/components` |
| `@lib` | `src/shared/lib` |
| `@hooks` | `src/shared/hooks` |
| `@utils` | `src/shared/utils` |
| `@schemas` | `src/shared/schemas` |
| `@assets` | `src/assets` |

## Nomenclatura

- Arquivos: `kebab-case` (`user-card.tsx`, `use-users.ts`, `user.schema.ts`, `get-users.ts`)
- Componentes: `PascalCase` · funções/variáveis: `camelCase`
- Página: `src/features/{feature}/index.tsx` exportando `{Feature}Page`
- Sufixos: `.schema.ts`, `.layout.tsx`, `-skeleton.tsx`, `-error-alert.tsx`, `-query-status.tsx`, `use-*.ts`

## Onde colocar cada coisa

| Tipo | Caminho |
| ---- | ------- |
| UI base | `src/shared/components/ui/` |
| Componente de feature | `src/features/{f}/components/` |
| Página (entry da rota) | `src/features/{f}/index.tsx` |
| Layout | `src/app/layouts/` |
| Hook compartilhado | `src/shared/hooks/` |
| Hook de feature | `src/features/{f}/hooks/` |
| Schema compartilhado | `src/shared/schemas/` |
| Schema de feature | `src/features/{f}/schemas/` |
| Função HTTP de feature | `src/features/{f}/http/` |

Não mova código de feature para `shared/` sem reuso real entre 2+ features.

## Regras de componentes

- Reuse `@components/ui` antes de criar novos
- Props de componente → sempre `interface` (ex.: `UserCardProps`); `type` só quando necessário (union, utility, infer)
- Tipe parâmetros e retornos não-triviais · use `import type` para imports só-de-tipo
- Prefira named exports (`export function`)
- Componentes grandes → subcomponentes/hooks dentro da feature
- Estados de query → componha `*-skeleton.tsx`, `*-error-alert.tsx`, `*-query-status.tsx` + barrel `components/index.ts`
- HTTP, TanStack Query, validação, env → ver `critical-rules.mdc`

## TypeScript e comentários

- **Props** → `interface`, nunca `type`. **Unions/utilities** → `type` quando precisar (`type Status = "online" | "offline"`)
- **Sem comentários** dentro de `interface`/`type`, acima de funções React, ou no JSX (`{/* Hero */}`)
- **JSDoc permitido** em `src/shared/utils/` e `src/shared/components/` — descreve o que faz (hover no IDE)

## Estilização e imports

- Tailwind v4 + `cn()` de `@utils/cn` · `cva` para variantes · aceite `className?: string`
- Tokens do tema em `src/styles/globals.css` (`bg-background`, `text-foreground`, etc.)
- Ordem de imports: externos → `import type` → aliases → relativos (grupos separados por linha em branco)

## Docs de referência

- `.cursor/docs/COMPONENT_GUIDELINES.md` — anatomia de feature, exemplos, checklists
- `.cursor/docs/DEVELOPMENT_RULES.md` — env, HTTP, TanStack Query, providers

---

## Doc: DEVELOPMENT_RULES.md

# Development Rules

Regras obrigatórias de runtime, integrações e validação neste template.

> **Hierarquia da documentação**
>
> | Arquivo | Escopo |
> | ------- | ------ |
> | `rules/critical-rules.mdc` | Resumo mandatório (sempre carregado pelo agente) |
> | `rules/component-standards.mdc` | Resumo de arquitetura e pastas (sempre carregado) |
> | **`DEVELOPMENT_RULES.md` (este)** | Detalhes de env, HTTP, TanStack Query, providers |
> | `COMPONENT_GUIDELINES.md` | Estrutura de pastas, nomenclatura, anatomia de feature, exemplos de componentes |

---

## 1. Bootstrap via `/init`

Para iniciar um novo projeto a partir deste template, abra um chat em **modo Agent** e execute `/init`.

O agent pede nome, descrição, indexação e Open Graph, e atualiza metadados do projeto (`index.html`, `README.md`, `robots.txt`, etc.).

**Não** altera runtime: `package.json`, `src/`, `.env`, regras e docs ficam intactos.

> Definição completa: `.cursor/commands/init.md`.

---

## 2. Root mounting

O template usa `<div id="app"></div>` em `index.html` e `document.getElementById("app")` em `src/main.tsx`. **Esse id é fixo e não deve ser trocado** — mantenha `app` em ambos os arquivos.

### Checklist

- [ ] `index.html` usa `<div id="app"></div>`
- [ ] `src/main.tsx` usa `document.getElementById("app")`

---

## 3. Validação de variáveis de ambiente

Todo o boot é gated pelo schema Zod em `src/env.ts`:

```ts
export const envParseResult = envSchema.safeParse(import.meta.env);
export const env: Env | undefined = envParseResult.success
  ? envParseResult.data
  : undefined;
```

E `src/app/index.tsx` mostra `ErrorLayout` se `envIsValid === false`:

```tsx
if (!envIsValid) {
  return (
    <ErrorLayout
      title="Configuração de ambiente incompleta ou inválida"
      description="..."
      invalidParams={getEnvIssues()}
    />
  );
}
```

### Regras

- Adicione novas variáveis no schema **antes** de usá-las.
- Acesse via `env` (de `@/env`) — nunca `import.meta.env` direto.
- Nunca commit em `.env` com valores reais.
- Use o helper `required.string("NOME")` / `required.url("NOME")` para variáveis obrigatórias.

### Variáveis atuais

| Variável                      | Tipo                                    | Obrigatória            |
| ----------------------------- | --------------------------------------- | ---------------------- |
| `VITE_NODE_ENV`               | `"development" \| "qa" \| "production"` | (default: development) |
| `VITE_API_URL`                | URL                                     | Sim                    |
| `VITE_API_KEY`                | string                                  | Sim                    |
| `VITE_ENABLE_API_DELAY`       | `"true" \| "false"` → boolean           | Não                    |

---

## 4. Validação de parâmetros

Nunca confie em props opcionais, query params, eventos ou payloads de API. Valide antes de usar.

### Padrões

**Guard clause em página:**

```tsx
function ItemPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  if (!id) return <MissingParamsState />;
  return <ItemContent id={id} />;
}
```

**Guard clause em hook:**

```ts
export function useItem(itemId: string | null) {
  return useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getItem(itemId!),
    enabled: !!itemId,
  });
}
```

**Validação de resposta de API com Zod:**

```ts
const parsed = userSchema.safeParse(data);
if (!parsed.success) {
  throw new Error("Resposta inválida dos usuários da API");
}
return parsed.data;
```

---

## 5. HTTP

Cliente axios pré-configurado em `src/shared/lib/axios.ts`:

```ts
export const api = axios.create({ baseURL: env?.VITE_API_URL });
```

### Regras

- Importe `api` de `@lib` — **nunca** `axios` direto.
- Uma função por endpoint em `src/features/{feature}/http/` (ou `src/shared/http/` se reutilizado).
- Tipe parâmetros e `Promise<Retorno>`.
- Sempre `safeParse` na resposta + erro descritivo.

### Delay artificial em dev

Se `VITE_ENABLE_API_DELAY=true`, o `request` interceptor adiciona delay aleatório (0–4s). Útil para testar skeletons/loading.

---

## 6. TanStack Query

Configuração em `src/shared/lib/tanstack-query.ts`:

```ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
```

### Regras

- Toda query/mutation vive em um hook `use*` dentro da feature.
- `queryKey` descritivo e estável.
- Use `enabled` para queries dependentes de input opcional.
- No retorno do hook, **renomeie** com prefixo do recurso para evitar colisão quando compor múltiplos hooks na mesma página (`users`, `isLoadingUsers`, `refetchUsers`).
- Não use `axios` direto dentro de `queryFn` — sempre via função HTTP da feature.

---

## 7. Providers

Padrão de composição em `src/app/providers/index.tsx`:

```tsx
const OuterProviders = ComposeProviders([
  TooltipProvider,
  QueryClientProviderWrapper,
]);

const InnerProviders = ComposeProviders([]);
```

- **Outer**: providers que **não** dependem do Router (Query, Tooltip).
- **Inner**: providers que **dependem** do Router (vão dentro de `<BrowserRouter>`).
- Cada provider mora em `wrappers/{nome}-provider-wrapper.tsx` e é re-exportado em `wrappers/index.ts`.

---

## 8. Estrutura de pastas e features

Convenções de pastas, nomenclatura, anatomia de feature (schema → http → hook → componentes → página) e checklists vivem em **`COMPONENT_GUIDELINES.md`**.

Referência canônica no código: `src/features/users/`.

---

## 9. Checklist de nova variável de ambiente

1. [ ] Adicionada ao schema em `src/env.ts`
2. [ ] Adicionada ao `.env.example` (se existir) ou documentada
3. [ ] Acessada via `env.VITE_*` (não `import.meta.env`)
4. [ ] Marcada como obrigatória (`required.string` / `required.url`) ou opcional, com default coerente

---

## Doc: COMPONENT_GUIDELINES.md

# Component Guidelines

Guia de arquitetura, padrões e boas práticas para componentes neste template (React 19 + Vite + Tailwind v4 + shadcn/ui + TanStack Query + Zod).

> **Hierarquia da documentação**
>
> | Arquivo | Escopo |
> | ------- | ------ |
> | `rules/component-standards.mdc` | Resumo de pastas e nomenclatura (sempre carregado) |
> | `rules/critical-rules.mdc` | Resumo mandatório de runtime (sempre carregado) |
> | **`COMPONENT_GUIDELINES.md` (este)** | Estrutura de pastas, anatomia de feature, exemplos de componentes |
> | `DEVELOPMENT_RULES.md` | Env, HTTP, TanStack Query, providers (detalhes) |

---

## 1. Estrutura de pastas

```
src/
├── app/                              # Composição da aplicação
│   ├── index.tsx                     # <App />: valida env e monta providers + rotas
│   ├── not-found.tsx                 # Página 404
│   ├── layouts/
│   │   ├── app.layout.tsx            # Layout raiz (Outlet)
│   │   ├── error.layout.tsx          # Layout de erro (env inválida etc.)
│   │   └── index.ts
│   ├── providers/
│   │   ├── index.tsx                 # ComposeProviders + BrowserRouter + Toaster
│   │   └── wrappers/                 # Providers isolados (Query, ...)
│   └── router/
│       └── index.tsx                 # <AppRoutes /> com react-router-dom
├── features/
│   └── {feature}/                    # Feature self-contained
│       ├── index.tsx                 # Página (entry da rota), exporta {Feature}Page
│       ├── components/
│       │   ├── index.ts              # Barrel
│       │   ├── {entity}-card.tsx
│       │   ├── {entity}-card-skeleton.tsx
│       │   ├── {entity}-list.tsx
│       │   ├── {entity}-list-skeleton.tsx
│       │   ├── {entity}-error-alert.tsx
│       │   └── {entity}-query-status.tsx
│       ├── hooks/
│       │   └── use-{entity}.ts       # Encapsula TanStack Query
│       ├── http/
│       │   └── get-{entity}.ts       # Função HTTP + safeParse
│       └── schemas/
│           └── {entity}.schema.ts    # Zod + tipos
├── shared/
│   ├── components/
│   │   ├── ui/                       # shadcn/radix
│   │   ├── compose-providers.tsx
│   │   └── index.ts
│   ├── hooks/
│   ├── lib/                          # axios, tanstack-query
│   ├── schemas/                      # schemas compartilhados (ex.: theme, svg)
│   └── utils/                        # cn, env, local-storage
├── assets/                           # logos, ícones
├── styles/
│   └── globals.css                   # tokens do tema
├── env.ts                            # schema Zod das envs
├── main.tsx                          # createRoot e StrictMode
└── vite-env.d.ts
```

### Onde colocar cada coisa

| Tipo                       | Caminho                                | Quando usar                                      |
| -------------------------- | -------------------------------------- | ------------------------------------------------ |
| Componente UI base         | `src/shared/components/ui/`            | Reutilizável em qualquer feature                 |
| Componente de feature      | `src/features/{f}/components/`         | Específico de um domínio                         |
| Página (entry da rota)     | `src/features/{f}/index.tsx`           | Componente exportado e usado em `app/router`     |
| Layout                     | `src/app/layouts/`                     | Wrapper de rota (Outlet)                         |
| Hook compartilhado         | `src/shared/hooks/`                    | Reutilizado entre features                       |
| Hook de feature            | `src/features/{f}/hooks/`              | Query/mutation/estado local da feature           |
| Schema compartilhado       | `src/shared/schemas/`                  | Domínio cross-feature (theme, etc.)              |
| Schema de feature          | `src/features/{f}/schemas/`            | Validação de dados do domínio da feature        |
| Função HTTP                | `src/features/{f}/http/`               | Uma função por endpoint, tipada e validada      |
| Configuração de lib        | `src/shared/lib/`                      | axios, query client               |
| Utilitário                 | `src/shared/utils/`                    | Funções puras (cn, env, local-storage)           |

Composição de providers → `DEVELOPMENT_RULES.md` §8.

---

## 2. Path aliases

Configurados em `vite.config.ts` e `tsconfig.app.json`. Use sempre que possível:

| Alias         | Aponta para                  |
| ------------- | ---------------------------- |
| `@/`          | `src/`                       |
| `@components` | `src/shared/components`      |
| `@lib`        | `src/shared/lib`             |
| `@hooks`      | `src/shared/hooks`           |
| `@utils`      | `src/shared/utils`           |
| `@schemas`    | `src/shared/schemas`         |
| `@assets`     | `src/assets`                 |

Exemplo:

```tsx
import { Button } from "@components/ui/button";
import { api } from "@lib";
import { cn } from "@utils/cn";
```

---

## 3. Convenções de nomenclatura

### Arquivos (kebab-case)

```
user-card.tsx
user-card-skeleton.tsx
use-users.ts
user.schema.ts
get-users.ts
app.layout.tsx
```

### Sufixos por tipo

| Tipo                        | Sufixo            | Exemplo                       |
| --------------------------- | ----------------- | ----------------------------- |
| Página (entry de feature)   | `index.tsx`       | `features/users/index.tsx`    |
| Layout                      | `.layout.tsx`     | `app.layout.tsx`              |
| Schema                      | `.schema.ts`      | `user.schema.ts`              |
| Hook                        | `use-*.ts`        | `use-users.ts`                |
| Skeleton                    | `-skeleton.tsx`   | `user-card-skeleton.tsx`      |
| Estado de query             | `-query-status.tsx` | `users-query-status.tsx`    |
| Alerta de erro              | `-error-alert.tsx`  | `users-error-alert.tsx`     |
| HTTP                        | `get-*.ts`, `create-*.ts`, `update-*.ts`, `delete-*.ts` | `get-users.ts` |

### Código

| Tipo               | Padrão                          | Exemplo                          |
| ------------------ | ------------------------------- | -------------------------------- |
| Componente         | `PascalCase`                    | `UserCard`, `UsersPage`          |
| Variável/função    | `camelCase`                     | `handleRefetch`, `userCount`     |
| Tipo/interface     | `PascalCase`                    | `User`, `UserRecord`             |
| Constante          | `camelCase` ou `UPPER_SNAKE`    | `defaultConfig`, `MAX_RETRIES`   |
| Enum Zod (valores) | `camelCase`                     | `z.enum(["active", "inactive"])` |

### Props: `interface` vs `type`

- **Props de componente** → sempre `interface`, nunca `type`
- **`type`** → só quando realmente precisar: unions, intersections, mapped/utility types, `z.infer`, etc.
- Componha quando fizer sentido:

```ts
type Status = "online" | "offline";

interface User {
  name: string;
  status: Status;
}

interface UserCardProps {
  user: User;
  className?: string;
}
```

### Comentários

**Não adicionar:**

- Comentários dentro de `interface` ou `type` (inline ou bloco)
- Comentários acima de componentes/páginas React descrevendo o que fazem
- Comentários JSX entre seções (`{/* Hero */}`, `{/* Sidebar */}`)

O código deve ser autoexplicativo por nomenclatura e estrutura.

**JSDoc permitido** em:

- `src/shared/utils/` — funções utilitárias
- `src/shared/components/` — componentes compartilhados (ex.: `user-card.tsx`)

Descreva o propósito/comportamento — aparece no hover do IDE:

```tsx
/**
 * Renderiza os dados do usuário em formato de card.
 */
export function UserCard({ user }: UserCardProps) {
  // ...
}
```

Não use JSDoc em componentes de feature (`src/features/{f}/components/`).

---

## 4. Anatomia de uma feature

Use `src/features/users/` como referência canônica.

### 4.1 Schema (`schemas/user.schema.ts`)

```ts
import { z } from "zod";

export const userSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    username: z.string(),
    email: z.string(),
  }),
);

export type User = z.infer<typeof userSchema>;
export type UserRecord = User[number];
```

### 4.2 HTTP (`http/get-users.ts`)

```ts
import { api } from "@lib";

import { userSchema, type User } from "../schemas/user.schema";

export async function getUsers(): Promise<User> {
  const { data } = await api.get<unknown>("/users");
  const parsed = userSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("Resposta inválida dos usuários da API");
  }

  return parsed.data;
}
```

**Regras mandatórias:** `DEVELOPMENT_RULES.md` §5 (HTTP).

### 4.3 Hook (`hooks/use-users.ts`)

```ts
import { useQuery, type QueryFunction } from "@tanstack/react-query";

import { getUsers } from "../http/get-users";
import type { User } from "../schemas/user.schema";

export function useUsers() {
  const {
    data: users,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    isError: isErrorUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers as QueryFunction<User>,
  });

  return {
    users,
    isLoadingUsers,
    isFetchingUsers,
    isErrorUsers,
    usersError,
    refetchUsers,
  };
}
```

**Regras mandatórias:** `DEVELOPMENT_RULES.md` §6 (TanStack Query).

### 4.4 Componentes (`components/`)

Cada feature mantém:

- `{entity}-card.tsx` — item visual
- `{entity}-card-skeleton.tsx` — skeleton equivalente ao card
- `{entity}-list.tsx` — wrapper grid/lista
- `{entity}-list-skeleton.tsx` — skeletons em loop com mesma estrutura do list
- `{entity}-error-alert.tsx` — `<Alert variant="destructive">` com a mensagem
- `{entity}-query-status.tsx` — badges com flags da query (debug/visual)
- `index.ts` — barrel re-exportando todos

Padrão de skeleton:

```tsx
import { Card, CardContent, CardHeader } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";

export function UserCardSkeleton() {
  return (
    <Card size="sm">
      <CardHeader className="space-y-2 border-b border-border/60">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[85%]" />
        <Skeleton className="h-3 w-[60%]" />
      </CardContent>
    </Card>
  );
}
```

Padrão de list skeleton com `count`:

```tsx
interface UsersListSkeletonProps {
  count?: number;
}

export function UsersListSkeleton({ count = 6 }: UsersListSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### 4.5 Página (`index.tsx`)

A página orquestra hook + componentes. Padrão de loading/refetch:

```tsx
import { useCallback } from "react";

import { Button } from "@components/ui/button";

import { useUsers } from "./hooks/use-users";
import {
  UsersErrorAlert,
  UsersList,
  UsersListSkeleton,
  UsersQueryStatus,
} from "./components";

export function UsersPage() {
  const {
    users,
    isLoadingUsers,
    isFetchingUsers,
    isErrorUsers,
    usersError,
    refetchUsers,
  } = useUsers();

  const handleRefetch = useCallback(() => {
    void refetchUsers();
  }, [refetchUsers]);

  if (isLoadingUsers && !users) return <UsersListSkeleton count={6} />;
  if (isErrorUsers) {
    return <UsersErrorAlert message={(usersError as Error)?.message ?? "Erro"} />;
  }

  return (
    <section>
      <Button onClick={handleRefetch} disabled={isFetchingUsers}>
        {isFetchingUsers ? "Atualizando…" : "Recarregar"}
      </Button>
      {users ? <UsersList users={users} /> : null}
    </section>
  );
}
```

**Regras da página:**

- Página exporta `{Feature}Page` e é registrada em `src/app/router/index.tsx`.
- Tratar `isLoading` separado de `isFetching` (primeira carga vs. refetch).

### 4.6 Roteamento (`src/app/router/index.tsx`)

```tsx
import { Routes, Route } from "react-router-dom";

import { AppLayout } from "@/app/layouts";
import { NotFound } from "@/app/not-found";
import { UsersPage } from "@/features/users";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<UsersPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

---

## 5. Componentes UI base e cva

Use `cva` para componentes com variantes estruturadas:

```tsx
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

---

## 6. Estilização

- **Tailwind v4** + `cn()` (`clsx` + `tailwind-merge`) para classes condicionais.
- Aceite sempre `className?: string` em componentes reusáveis e combine com `cn(base, className)`.
- Use tokens do tema (`bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`) — não cores hardcoded.
- `cva` para variantes; classes inline para variações simples.

---

## 7. Ordem de imports

```tsx
// 1) Pacotes externos
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// 2) Tipos (import type)
import type { User } from "./schemas/user.schema";

// 3) Aliases internos
import { Button } from "@components/ui/button";
import { api } from "@lib";
import { cn } from "@utils/cn";

// 4) Imports relativos
import { useUsers } from "./hooks/use-users";
import { UsersList } from "./components";
```

Separe cada grupo por uma linha em branco.

---

## 8. Checklist de novo componente

1. [ ] Já existe similar em `@components/ui`?
2. [ ] É específico de feature (vai em `features/{f}/components/`) ou compartilhado?
3. [ ] Props tipadas com `interface` (não `type`)?
4. [ ] `import type` para imports só-de-tipo?
5. [ ] Inputs externos têm guard clause ou validação Zod?
6. [ ] Arquivo em kebab-case e nomenclatura segue os sufixos da seção 3?
7. [ ] Componente em PascalCase, named export?
8. [ ] `cn()` para classes condicionais e `className?` aceito?
9. [ ] Adicionado ao barrel `components/index.ts` da feature?
10. [ ] Sem comentários em JSX, acima de funções React ou dentro de interfaces?
11. [ ] JSDoc apenas se componente estiver em `shared/components/` ou util em `shared/utils/`?

## 9. Checklist de nova feature

1. [ ] Criada em `src/features/{feature}/` com `components/`, `hooks/`, `http/`, `schemas/`, `index.tsx`
2. [ ] Schema Zod em `schemas/` com `z.infer` exportado
3. [ ] Função HTTP em `http/` — regras em `DEVELOPMENT_RULES.md` §5
4. [ ] Hook `use-*.ts` encapsulando query/mutation — regras em `DEVELOPMENT_RULES.md` §6
5. [ ] Componentes: card, card-skeleton, list, list-skeleton, error-alert, query-status + barrel
6. [ ] Página `index.tsx` exportando `{Feature}Page`, tratando loading/fetching/error
7. [ ] Rota registrada em `src/app/router/index.tsx`
8. [ ] Imports usam aliases (`@components`, `@lib`, `@utils`, `@/...`)
