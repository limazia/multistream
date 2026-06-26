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
