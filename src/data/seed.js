export const categories = [
  'Copos da felicidade',
  'Bolos',
  'Brownies',
  'Mini brownies',
  'Cestas comemorativas',
  'Docinhos',
  'Brownies recheados',
  'Ovos de Páscoa'
]

export const optionTypes = {
  fillings: 'Recheios',
  masses: 'Massas',
  shells: 'Cascas',
  ingredients: 'Ingredientes'
}

export const initialOptions = [
  { id: 'op-1', type: 'fillings', name: 'Brigadeiro' },
  { id: 'op-2', type: 'fillings', name: 'Ninho' },
  { id: 'op-3', type: 'fillings', name: 'Nutella' },
  { id: 'op-4', type: 'fillings', name: 'Doce de leite' },
  { id: 'op-5', type: 'fillings', name: 'Oreo' },
  { id: 'op-6', type: 'fillings', name: 'Morango' },
  { id: 'op-7', type: 'masses', name: 'Chocolate' },
  { id: 'op-8', type: 'masses', name: 'Baunilha' },
  { id: 'op-9', type: 'masses', name: 'Red Velvet' },
  { id: 'op-10', type: 'masses', name: 'Brownie' },
  { id: 'op-11', type: 'shells', name: 'Chocolate ao leite' },
  { id: 'op-12', type: 'shells', name: 'Chocolate branco' },
  { id: 'op-13', type: 'shells', name: 'Meio amargo' },
  { id: 'op-14', type: 'ingredients', name: 'Oreo' },
  { id: 'op-15', type: 'ingredients', name: 'Morangos' },
  { id: 'op-16', type: 'ingredients', name: 'Granulado' },
  { id: 'op-17', type: 'ingredients', name: 'Confete' }
]

export const initialProducts = [
  {
    id: 'prod-1',
    name: 'Copo da Felicidade',
    category: 'Copos da felicidade',
    price: 18,
    prep_time: '24h',
    active: true,
    description: 'Copo montado com creme, massa, recheio e toppings.',
    options: { fillings: ['Ninho', 'Brigadeiro', 'Morango'], masses: ['Brownie', 'Chocolate'], shells: [], ingredients: ['Oreo', 'Morangos', 'Granulado'] }
  },
  {
    id: 'prod-2',
    name: 'Bolo Personalizado',
    category: 'Bolos',
    price: 95,
    prep_time: '48h',
    active: true,
    description: 'Bolo sob encomenda com massa e recheio à escolha.',
    options: { fillings: ['Ninho', 'Doce de leite', 'Brigadeiro'], masses: ['Chocolate', 'Baunilha', 'Red Velvet'], shells: [], ingredients: ['Morangos', 'Confete'] }
  },
  {
    id: 'prod-3',
    name: 'Brownie Tradicional',
    category: 'Brownies',
    price: 12,
    prep_time: '24h',
    active: true,
    description: 'Brownie artesanal tradicional.',
    options: { fillings: [], masses: ['Brownie'], shells: [], ingredients: ['Granulado'] }
  },
  {
    id: 'prod-4',
    name: 'Mini Brownie',
    category: 'Mini brownies',
    price: 5,
    prep_time: '24h',
    active: true,
    description: 'Mini brownie para festas e lembranças.',
    options: { fillings: ['Ninho', 'Nutella', 'Brigadeiro'], masses: ['Brownie'], shells: [], ingredients: ['Confete', 'Granulado'] }
  },
  {
    id: 'prod-5',
    name: 'Cesta Comemorativa',
    category: 'Cestas comemorativas',
    price: 120,
    prep_time: '72h',
    active: true,
    description: 'Cesta para Dia dos Namorados, Dia das Mães e datas especiais.',
    options: { fillings: [], masses: [], shells: [], ingredients: ['Brownies', 'Docinhos', 'Cartão', 'Embalagem especial'] }
  },
  {
    id: 'prod-6',
    name: 'Docinhos Sortidos',
    category: 'Docinhos',
    price: 2.5,
    prep_time: '24h',
    active: true,
    description: 'Docinhos para festas e encomendas.',
    options: { fillings: ['Brigadeiro', 'Ninho', 'Doce de leite'], masses: [], shells: [], ingredients: ['Granulado', 'Confete'] }
  },
  {
    id: 'prod-7',
    name: 'Brownie Recheado',
    category: 'Brownies recheados',
    price: 16,
    prep_time: '24h',
    active: true,
    description: 'Brownie com recheio cremoso.',
    options: { fillings: ['Nutella', 'Doce de leite', 'Ninho'], masses: ['Brownie'], shells: [], ingredients: ['Oreo', 'Morangos'] }
  },
  {
    id: 'prod-8',
    name: 'Ovo de Páscoa de Colher',
    category: 'Ovos de Páscoa',
    price: 45,
    prep_time: '48h',
    active: true,
    description: 'Ovo de colher com casca e recheio à escolha.',
    options: { fillings: ['Oreo', 'Ninho', 'Brigadeiro'], masses: [], shells: ['Chocolate ao leite', 'Chocolate branco', 'Meio amargo'], ingredients: ['Oreo', 'Confete'] }
  }
]

export const initialOrders = [
  {
    id: 'ped-2031',
    code: '#DF-2031',
    client_name: 'Mariana Souza',
    client_phone: '(48) 99867-3404',
    contact_source: 'WhatsApp',
    product_name: 'Copo da Felicidade',
    quantity: 3,
    total: 54,
    payment_status: 'Sinal',
    shipping_status: 'Retirada',
    order_status: 'Em produção',
    due_date: 'Hoje, 16:00',
    notes: '2 com morango e 1 com Oreo'
  },
  {
    id: 'ped-2030',
    code: '#DF-2030',
    client_name: 'Ana Clara',
    client_phone: '(48) 99123-4567',
    contact_source: 'Instagram',
    product_name: 'Bolo Personalizado',
    quantity: 1,
    total: 145,
    payment_status: 'Pago',
    shipping_status: 'Pendente',
    order_status: 'Confirmado',
    due_date: 'Amanhã, 10:00',
    notes: 'Massa chocolate, recheio Ninho com morango'
  },
  {
    id: 'ped-2029',
    code: '#DF-2029',
    client_name: 'João Pedro',
    client_phone: '(48) 98888-1111',
    contact_source: 'WhatsApp',
    product_name: 'Ovo de Páscoa de Colher',
    quantity: 2,
    total: 110,
    payment_status: 'Não pago',
    shipping_status: 'Pendente',
    order_status: 'Aguardando pagamento',
    due_date: 'Sexta, 18:00',
    notes: 'Casca branca, recheio Oreo'
  }
]
