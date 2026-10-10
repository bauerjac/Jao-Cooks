export interface MenuItemDef {
  id: string;
  name: string;
  category: 'burger' | 'porcao' | 'bebida' | 'sobremesa' | 'combo';
  station: 'grelha' | 'montagem' | 'fritadeira' | 'bebidas' | 'sobremesas';
  price: number;
  description: string;
  defaultOptions: string[];
  suggestedNotes: string[];
}

export const JAO_COOKS_MENU: MenuItemDef[] = [
  {
    id: 'm-1',
    name: 'Jão Burger Clássico',
    category: 'burger',
    station: 'grelha',
    price: 34.9,
    description: 'Pão brioche, burger artesanal 180g, cheddar cremoso, alface, tomate e maionese da casa.',
    defaultOptions: ['Pão Brioche', 'Blend 180g', 'Cheddar Inglês'],
    suggestedNotes: ['Ponto: Bem passado', 'Ponto: Ao ponto', 'Sem cebola', 'Sem maionese', 'Molho à parte'],
  },
  {
    id: 'm-2',
    name: 'Jão Bacon Monster Duplo',
    category: 'burger',
    station: 'grelha',
    price: 44.9,
    description: 'Dois burgers de 150g prensados, fatias generosas de bacon crocante, barbecue rústico e queijo prato.',
    defaultOptions: ['2x Blend 150g', 'Bacon Glaciado', 'Queijo Prato Duplo'],
    suggestedNotes: ['Bacon bem crocante', 'Sem picles', 'Carne bem passada', 'Sem molho barbecue'],
  },
  {
    id: 'm-3',
    name: 'Smash Jão Trufado',
    category: 'burger',
    station: 'grelha',
    price: 39.9,
    description: 'Pão australiano tostado na manteiga, dois smashs 90g com crosta perfeita, queijo gouda e maionese trufada.',
    defaultOptions: ['Pão Australiano', '2x Smash 90g', 'Queijo Gouda', 'Maionese Trufada'],
    suggestedNotes: ['Sem cebola caramelizada', 'Pouca maionese', 'Sem queijo'],
  },
  {
    id: 'm-4',
    name: 'Jão Chicken Supreme',
    category: 'burger',
    station: 'fritadeira',
    price: 32.9,
    description: 'Sobrecoxa empanada super crocante, coleslaw fresco, picles adocicado e maionese de alho negro.',
    defaultOptions: ['Frango Empanado', 'Salada Coleslaw', 'Picles Doce'],
    suggestedNotes: ['Sem picles', 'Coleslaw à parte', 'Frango bem frito'],
  },
  {
    id: 'm-5',
    name: 'Combo Família Jão (3 Burgers + Fritas)',
    category: 'combo',
    station: 'montagem',
    price: 98.0,
    description: '3 burgers artesanais à escolha + 2 porções de batatas rústicas + 3 molhos especiais.',
    defaultOptions: ['3x Burgers Selecionados', '2x Batatas Rústicas', 'Molho da Casa'],
    suggestedNotes: ['Embalar para viagem', 'Separar molhos', 'Sem cebola em todos'],
  },
  {
    id: 'm-6',
    name: 'Batata Rústica com Páprica e Alecrim',
    category: 'porcao',
    station: 'fritadeira',
    price: 18.9,
    description: 'Corte rústico artesanal com alecrim fresco e toque de flor de sal.',
    defaultOptions: ['Flor de sal e alecrim', 'Molho Barbecue'],
    suggestedNotes: ['Bem sequinha', 'Sem sal', 'Molho extra'],
  },
  {
    id: 'm-7',
    name: 'Onion Rings Crocantes',
    category: 'porcao',
    station: 'fritadeira',
    price: 21.9,
    description: 'Anéis de cebola empanados em farinha especial crocante servidos com molho ranch.',
    defaultOptions: ['Molho Ranch Artesanal'],
    suggestedNotes: ['Fritar bem', 'Molho à parte'],
  },
  {
    id: 'm-8',
    name: 'Refrigerante Lata 350ml',
    category: 'bebida',
    station: 'bebidas',
    price: 7.5,
    description: 'Coca-Cola, Guaraná, Fanta ou Sprite (Normal ou Zero).',
    defaultOptions: ['Lata 350ml'],
    suggestedNotes: ['Com gelo e limão', 'Sem gelo', 'Bebida bem gelada'],
  },
  {
    id: 'm-9',
    name: 'Suco Natural da Fruta 500ml',
    category: 'bebida',
    station: 'bebidas',
    price: 11.9,
    description: 'Laranja fresca, maracujá ou limonada suíça com hortelã.',
    defaultOptions: ['Copo 500ml'],
    suggestedNotes: ['Sem açúcar', 'Sem gelo', 'Adoçante à parte'],
  },
  {
    id: 'm-10',
    name: 'Milkshake de Frutas Vermelhas / Nutella',
    category: 'sobremesa',
    station: 'bebidas',
    price: 24.9,
    description: 'Sorvete artesanal batido com calda de frutas do bosque ou Nutella e chantilly fresco.',
    defaultOptions: ['Copo 400ml com Chantilly'],
    suggestedNotes: ['Sem chantilly', 'Calda extra', 'Canudo grosso'],
  },
];
