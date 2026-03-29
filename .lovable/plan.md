

# Sam Esthetic — E-commerce Mobile-First

Loja 100% independente construída diretamente no Lovable, sem dependência de Shopify ou plataformas externas.

## Visão Geral

E-commerce mobile-first para venda de produtos de cílios e materiais para Lash Design, com catálogo de produtos, carrinho de compras, e checkout via WhatsApp (forma mais prática para começar sem gateway de pagamento).

## Estrutura de Páginas

1. **Home** — Banner principal, categorias em destaque, produtos populares
2. **Catálogo** — Grid de produtos com filtro por categoria
3. **Produto** — Detalhes, fotos, preço, botão adicionar ao carrinho
4. **Carrinho** — Lista de itens, quantidades, total
5. **Checkout** — Formulário de dados + envio do pedido via WhatsApp

## Design

- Paleta baseada na identidade visual da marca (rosa/roxo conforme logo enviado)
- Layout mobile-first (otimizado para tela ~592px)
- Navegação inferior fixa (Home, Catálogo, Carrinho)
- Cards de produto com imagem, nome e preço

## Funcionalidades

- **Catálogo estático** — produtos definidos em arquivo de dados (sem backend inicialmente)
- **Carrinho** — estado local com Context API, persistido em localStorage
- **Busca** — filtro por nome de produto
- **Categorias** — Cílios, Colas, Ferramentas, Kits
- **Checkout WhatsApp** — monta mensagem com resumo do pedido e abre WhatsApp

## Detalhes Técnicos

- React + TypeScript + Tailwind (stack existente)
- Context API para estado do carrinho
- React Router para navegação entre páginas
- Dados de produtos em `src/data/products.ts`
- Componentes: `Header`, `BottomNav`, `ProductCard`, `CartItem`, `CategoryFilter`
- Páginas: `Index`, `Catalog`, `ProductDetail`, `Cart`, `Checkout`

## Evolução Futura (não inclusa agora)

- Backend com Supabase para gestão de produtos e pedidos
- Autenticação de clientes
- Integração com gateway de pagamento (Stripe/Mercado Pago)
- Painel admin para gerenciar estoque

