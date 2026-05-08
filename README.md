# Doceria SaaS

Sistema administrativo para uma doceria artesanal gerenciar produtos, pedidos, pagamentos, envios e opções de montagem em um painel simples.

O projeto foi desenvolvido com foco em uma usuária leiga, permitindo controlar a operação da doceria sem precisar editar código.

## Funcionalidades

- Login com e-mail e senha
- Dashboard com resumo da operação
- Cadastro de produtos
- Edição e exclusão de produtos
- Escolha de ícone ou foto para o produto
- Cadastro de pedidos
- Edição e exclusão de pedidos
- Controle de pagamento:
  - Pago 100%
  - Pago 50%
  - Não pago
- Controle de envio:
  - Enviado
  - Pendente
  - Retirada
- Registro da origem do contato:
  - Instagram
  - WhatsApp
- Cadastro de massas, recheios, cascas e ingredientes
- Loja interna para simular pedidos
- Carrinho de pedidos
- Persistência de rascunhos no navegador
- Integração com Supabase

## Tecnologias usadas

- React
- Vite
- JavaScript
- CSS
- Supabase

## Estrutura do projeto

```txt
doceria-saas/
├─ src/
│  ├─ data/
│  │  └─ seed.js
│  ├─ lib/
│  │  └─ db.js
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ supabase/
│  └─ schema-secure.sql
├─ index.html
├─ package.json
├─ package-lock.json
├─ README.md
└─ .gitignore
```

## Como rodar o projeto

Clone o repositório:

```bash
git clone https://github.com/fabiothieres/doceria-saas.git
```

Entre na pasta do projeto:

```bash
cd doceria-saas
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env.local` na raiz do projeto com as variáveis do Supabase:

```env
VITE_SUPABASE_URL=SUA_URL_DO_SUPABASE
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA_DO_SUPABASE
```

Rode o projeto:

```bash
npm run dev
```

Acesse no navegador:

```txt
http://localhost:5173
```

## Scripts disponíveis

### `npm run dev`

Inicia o projeto em modo desenvolvimento.

### `npm run build`

Gera a versão de produção.

### `npm run preview`

Executa localmente a versão gerada para produção.

## Observações

O arquivo `.env.local` não deve ser enviado para o GitHub, pois contém variáveis de ambiente do projeto.

A pasta `node_modules` também não deve ser versionada. Para recriá-la, basta rodar:

```bash
npm install
```

## Status do projeto

Projeto funcional com:

- autenticação;
- banco de dados;
- CRUD de produtos;
- CRUD de pedidos;
- controle de status;
- painel administrativo;
- integração com Supabase.

## Direitos autorais

Copyright (c) 2026 Fabio Henrique Thieres Cardoso Santana.

Todos os direitos reservados.

Este projeto e seu código-fonte são de propriedade de Fabio Henrique Thieres Cardoso Santana. Nenhuma parte deste projeto pode ser copiada, modificada, distribuída, publicada, sublicenciada, vendida ou utilizada para fins comerciais sem autorização prévia e por escrito do autor.
