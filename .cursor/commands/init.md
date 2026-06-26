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
