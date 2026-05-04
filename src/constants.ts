import { Product } from './types';

export const PRODUCTS: Product[] = [
  // --- Biltong & Game Biltong ---
  {
    id: 'bt-01',
    name: 'Beef Biltong',
    description: 'Traditional Jozi-crafted beef biltong. Hand-cured with our heritage spice blend.',
    price: 68,
    category: 'biltong',
    flavors: ['Original', 'Chilli'],
    image: '/images/board.png',
    popular: true
  },
  {
    id: 'bt-02',
    name: 'Beef Yellow Fat',
    description: 'For the connoisseur. Traditionally cured beef with a rich, buttery yellow fat layer.',
    price: 72,
    category: 'biltong',
    flavors: ['Original', 'Chilli'],
    image: '/images/fatty.png',
    popular: true
  },
  {
    id: 'gm-01',
    name: 'Gemsbok Biltong',
    description: 'Lean, dark, and exceptionally flavorful game biltong from the Kalahari gemsbok.',
    price: 85,
    category: 'game',
    flavors: ['Original', 'Chilli'],
    image: '/images/game.png',
  },
  {
    id: 'gm-02',
    name: 'Kudu Biltong',
    description: 'A South African favorite. Distinctive, rich flavor with a smooth velvet-like texture.',
    price: 85,
    category: 'game',
    flavors: ['Original', 'Chilli'],
    image: '/images/game.png',
    popular: true
  },
  {
    id: 'gm-03',
    name: 'Eland Biltong',
    description: 'The largest of the antelope. Known for its tenderness and refined wild flavor.',
    price: 88,
    category: 'game',
    flavors: ['Original', 'Chilli'],
    image: '/images/game.png',
  },
  {
    id: 'gm-04',
    name: 'Ostrich Biltong',
    description: 'Extremely lean and healthy. A dark, iron-rich delicacy with a unique texture.',
    price: 90,
    category: 'game',
    flavors: ['Original', 'Chilli'],
    image: '/images/game.png',
  },
  {
    id: 'gm-05',
    name: 'Springbok Biltong',
    description: 'The national favorite. Small, intensely flavored cuts with a clean wild finish.',
    price: 85,
    category: 'game',
    flavors: ['Original', 'Chilli'],
    image: '/images/game.png',
  },

  // --- Wors (Droëwors) ---
  {
    id: 'dw-01',
    name: 'Beef Droëwors',
    description: 'Traditional dried sausage made with pure beef and delicate spices.',
    price: 70,
    category: 'droewors',
    flavors: ['Original', 'Chilli'],
    image: '/images/droewors.png',
    popular: true
  },
  {
    id: 'dw-02',
    name: 'Game Droëwors',
    description: 'Rustic and wild. Our signature blend of game meat and traditional spices.',
    price: 75,
    category: 'droewors',
    flavors: ['Original', 'Chilli'],
    image: '/images/droewors.png',
  },
  {
    id: 'dw-03',
    name: 'Nibbles / Cherry Wors',
    description: 'Bite-sized dried sausage treats. Perfect for snacking on the go.',
    price: 72,
    category: 'droewors',
    flavors: ['Original', 'Chilli'],
    image: '/images/droewors.png',
  },

  // --- Snapstix ---
  {
    id: 'ss-01',
    name: 'Beef Snapstix',
    description: 'Crunchy, thin snap-sticks of cured beef. High protein energy snack.',
    price: 75,
    category: 'snapstix',
    flavors: ['Original'],
    image: '/images/packets.png',
  },
  {
    id: 'ss-02',
    name: 'Chilli Snapstix',
    description: 'Our signature beef sticks with a fiery peri-peri kick.',
    price: 75,
    category: 'snapstix',
    flavors: ['Chilli'],
    image: '/images/packets.png',
    popular: true
  },
  {
    id: 'ss-03',
    name: 'Game Snapstix',
    description: 'Thinly sliced game meat snapping sticks. Intense and satisfying.',
    price: 80,
    category: 'snapstix',
    flavors: ['Original', 'Chilli'],
    image: '/images/packets.png',
  },
  {
    id: 'ss-04',
    name: 'Chicken Snapstix',
    description: 'A lighter alternative. Cured chicken breast sticks with a savory finish.',
    price: 78,
    category: 'snapstix',
    flavors: ['Original', 'Chilli'],
    image: '/images/packets.png',
  },

  // --- Specialties ---
  {
    id: 'sp-01',
    name: 'Beef Chips',
    description: 'Crispy, thinly sliced biltong shavings. Like chips, but better.',
    price: 70,
    category: 'specialty',
    flavors: ['Original', 'Chilli'],
    image: '/images/board.png',
  },
  {
    id: 'sp-02',
    name: 'Bacon Biltong',
    description: 'Cured and dried bacon. A smoky, salty explosion of flavor.',
    price: 82,
    category: 'specialty',
    flavors: ['Original', 'Chilli'],
    image: '/images/board.png',
  },
  {
    id: 'sp-03',
    name: 'Babalas Mix',
    description: 'A powerful mix of biltong and spices designed to cure any Jozi night.',
    price: 95,
    category: 'specialty',
    flavors: ['Original', 'Chilli'],
    image: '/images/board.png',
  },
  {
    id: 'sp-04',
    name: 'Biltong Poeier (Powder)',
    description: 'Finely ground biltong. Perfect for spreads, soups, or just eating by the spoon.',
    price: 60,
    category: 'specialty',
    flavors: ['Original', 'Chilli'],
    image: '/images/board.png',
  }
];

export const REVIEWS = [
  {
    id: '1',
    user: 'Thabo M.',
    rating: 5,
    comment: 'The Kudu biltong is exceptional. Best I have had in Jozi.',
    date: '2024-03-24'
  },
  {
    id: '2',
    user: 'Sarah K.',
    rating: 5,
    comment: 'Chilli Snapstix are my daily snack. Perfect level of heat!',
    date: '2024-03-20'
  },
  {
    id: '3',
    user: 'Pieter v.d.M',
    rating: 4,
    comment: 'Great Droëwors and fast nationwide delivery. Highly recommend.',
    date: '2024-03-15'
  }
];
