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
