# CTT · Voz do Cliente B2B

App interna de recolha de feedback para a equipa de **Digital Experience** dos CTT.
Pensada para o **João** — colega com forte experiência operacional em Centros de
Distribuição e literacia digital moderada — para registar o que os clientes B2B
reportam sobre o portal e gerar uma visão quinzenal de gestão.

## Funcionalidades

- **Registar Contacto** — formulário direto ao assunto com:
  - ID de Cliente e ID de Contrato (obrigatórios)
  - Área do portal (Envios, Faturação, Gestão de Contas, Relatórios, Outros)
  - Escala visual de fricção 1–5 (Muito Fácil → Bloqueio Total)
  - Verbatim do cliente
  - Insight operacional do João
  - Botão grande de submissão com feedback de sucesso
- **Painel de Análise** quinzenal:
  - Cards de resumo (total, janela 14 dias, média de dificuldade, área mais problemática)
  - Gráfico empilhado de fricção por área
  - Tabela com filtro por ID de Cliente / Contrato e ação de eliminar registos

## Stack

- React 18 + Vite
- Tailwind CSS (tema dark Slate/Zinc com acento Emerald CTT)
- lucide-react para iconografia
- Persistência local em `localStorage` (chave `ctt.feedback.entries.v1`)

## Como correr

```bash
npm install
npm run dev
```

Abre <http://localhost:5173>.

A app é responsiva — desenhada para tablet (o João pode usá-la enquanto vê o webinar).
