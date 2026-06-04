import { Product } from './types';

export const PRODUCTS: Product[] = [
  // --- Biltong & Game Biltong ---
  {
    id: 'bt-01',
    name: 'Beef Biltong',
    description: 'Traditional Jozi-crafted beef biltong. Hand-cured with our heritage spice blend.',
    prices: { 50: 45.54, 80: 68.31, 100: 86.02, 150: 126.50, 200: 164.45, 250: 207.46, 500: 414.92, 1000: 829.84 },
    category: 'biltong',
    flavors: ['Original', 'Chilli'],
    image: '/images/board.png',
    popular: true
  },
  {
    id: 'bt-02',
    name: 'Beef Yellow Fat',
    description: 'For the connoisseur. Traditionally cured beef with a rich, buttery yellow fat layer.',
    prices: { 50: 48.07, 80: 73.37, 100: 91.08, 150: 136.62, 200: 179.63, 250: 227.70, 500: 455.40, 1000: 910.80 },
    category: 'biltong',
    flavors: ['Original', 'Chilli'],
    image: '/images/fatty.png',
    popular: true
  },
  {
    id: 'gm-01',
    name: 'Gemsbok Biltong',
    description: 'Lean, dark, and exceptionally flavorful game biltong from the Kalahari gemsbok.',
    prices: { 50: 43.01, 80: 65.78, 100: 80.96, 150: 118.91, 200: 156.86, 250: 197.34, 500: 394.68, 1000: 789.36 },
    category: 'game',
    flavors: ['Original', 'Chilli'],
    image: '/images/game.png',
  },
  {
    id: 'gm-02',
    name: 'Kudu Biltong',
    description: 'A South African favorite. Distinctive, rich flavor with a smooth velvet-like texture.',
    prices: { 50: 43.01, 80: 65.78, 100: 80.96, 150: 118.91, 200: 156.86, 250: 197.34, 500: 394.68, 1000: 789.36 },
    category: 'game',
    flavors: ['Original', 'Chilli'],
    image: '/images/game.png',
    popular: true
  },
  {
    id: 'gm-03',
    name: 'Eland Biltong',
    description: 'The largest of the antelope. Known for its tenderness and refined wild flavor.',
    prices: { 50: 43.01, 80: 65.78, 100: 80.96, 150: 118.91, 200: 156.86, 250: 197.34, 500: 394.68, 1000: 789.36 },
    category: 'game',
    flavors: ['Original', 'Chilli'],
    image: '/images/game.png',
  },
  {
    id: 'gm-04',
    name: 'Ostrich Biltong',
    description: 'Extremely lean and healthy. A dark, iron-rich delicacy with a unique texture.',
    prices: { 50: 45.54, 80: 68.31, 100: 86.02, 150: 126.50, 200: 164.45, 250: 207.46, 500: 414.92, 1000: 829.84 },
    category: 'game',
    flavors: ['Original', 'Chilli'],
    image: '/images/game.png',
  },
  {
    id: 'gm-05',
    name: 'Springbok Biltong',
    description: 'The national favorite. Small, intensely flavored cuts with a clean wild finish.',
    prices: { 50: 43.01, 80: 65.78, 100: 80.96, 150: 118.91, 200: 156.86, 250: 197.34, 500: 394.68, 1000: 799.48 }, // 799.48 is in sheet for Springbok 1000g
    category: 'game',
    flavors: ['Original', 'Chilli'],
    image: '/images/game.png',
  },

  // --- Wors (Droëwors) ---
  {
    id: 'dw-01',
    name: 'Beef Droëwors',
    description: 'Traditional dried sausage made with pure beef and delicate spices.',
    prices: { 50: 37.95, 80: 73.37, 100: 73.37, 150: 106.26, 200: 141.68, 250: 177.10, 500: 354.20, 1000: 708.40 },
    category: 'droewors',
    flavors: ['Original', 'Chilli'],
    image: '/images/droewors.png',
    popular: true
  },
  {
    id: 'dw-02',
    name: 'Game Droëwors',
    description: 'Rustic and wild. Our signature blend of game meat and traditional spices.',
    prices: { 50: 37.95, 80: 68.31, 100: 68.31, 150: 101.20, 200: 134.09, 250: 169.51, 500: 339.02, 1000: 678.04 },
    category: 'droewors',
    flavors: ['Original', 'Chilli'],
    image: '/images/droewors.png',
  },
  {
    id: 'dw-03',
    name: 'Nibbles / Cherry Wors',
    description: 'Bite-sized dried sausage treats. Perfect for snacking on the go.',
    prices: { 50: 43.01, 80: 80.96, 100: 80.96, 150: 118.91, 200: 156.86, 250: 197.34, 500: 394.68, 1000: 789.36 },
    category: 'droewors',
    flavors: ['Original', 'Chilli'],
    image: '/images/droewors.png',
  },

  // --- Snapstix ---
  {
    id: 'ss-01',
    name: 'Beef Snapstix',
    description: 'Crunchy, thin snap-sticks of cured beef. High protein energy snack.',
    prices: { 50: 55.66, 80: 86.02, 100: 106.26, 150: 159.39, 200: 209.99, 250: 265.65, 500: 531.30, 1000: 1062.60 },
    category: 'snapstix',
    flavors: ['Original'],
    image: '/images/packets.png',
  },
  {
    id: 'ss-02',
    name: 'Chilli Snapstix',
    description: 'Our signature beef sticks with a fiery peri-peri kick.',
    prices: { 50: 55.66, 80: 86.02, 100: 106.26, 150: 159.39, 200: 209.99, 250: 265.65, 500: 531.30, 1000: 1062.60 },
    category: 'snapstix',
    flavors: ['Chilli'],
    image: '/images/packets.png',
    popular: true
  },
  {
    id: 'ss-03',
    name: 'Game Snapstix',
    description: 'Thinly sliced game meat snapping sticks. Intense and satisfying.',
    prices: { 50: 53.13, 80: 83.49, 100: 103.73, 150: 151.80, 200: 202.40, 250: 253.00, 500: 506.00, 1000: 1012.00 },
    category: 'snapstix',
    flavors: ['Original', 'Chilli'],
    image: '/images/packets.png',
  },
  {
    id: 'ss-04',
    name: 'Chicken Snapstix',
    description: 'A lighter alternative. Cured chicken breast sticks with a savory finish.',
    prices: { 50: 37.95, 80: 58.19, 100: 70.84, 150: 103.73, 200: 136.62, 250: 174.57, 500: 349.14, 1000: 698.28 },
    category: 'snapstix',
    flavors: ['Original', 'Chilli'],
    image: '/images/packets.png',
  },

  // --- Specialties ---
  {
    id: 'sp-01',
    name: 'Beef Chips',
    description: 'Crispy, thinly sliced biltong shavings. Like chips, but better.',
    prices: { 50: 55.66, 80: 86.02, 100: 106.26, 150: 159.39, 200: 209.99, 250: 265.65, 500: 531.30, 1000: 1062.60 },
    category: 'specialty',
    flavors: ['Original', 'Chilli'],
    image: '/images/board.png',
  },
  {
    id: 'sp-02',
    name: 'Bacon Biltong',
    description: 'Cured and dried bacon. A smoky, salty explosion of flavor.',
    prices: { 50: 50.60, 80: 80.96, 100: 98.67, 150: 144.21, 200: 192.28, 250: 242.88, 500: 485.76, 1000: 971.52 },
    category: 'specialty',
    flavors: ['Original', 'Chilli'],
    image: '/images/board.png',
  },
  {
    id: 'sp-03',
    name: 'Babalas Mix',
    description: 'A powerful mix of biltong and spices designed to cure any Jozi night.',
    prices: { 50: 37.95, 80: 58.19, 100: 70.84, 150: 103.73, 200: 136.62, 250: 174.57, 500: 349.14, 1000: 698.28 },
    category: 'specialty',
    flavors: ['Original', 'Chilli'],
    image: '/images/board.png',
  },
  {
    id: 'sp-04',
    name: 'Biltong Fosier (Powder)',
    description: 'Finely ground biltong. Perfect for spreads, soups, or just eating by the spoon.',
    prices: { 50: 45.54, 80: 70.84, 100: 88.55, 150: 129.03, 200: 172.04, 250: 215.05, 500: 430.10, 1000: 860.20 },
    category: 'specialty',
    flavors: ['Original', 'Chilli'],
    image: '/images/board.png',
  },
  {
    id: 'chilli-deal',
    name: 'Beef Biltong (Chilli) - 3 Pack Deal',
    description: 'Special Buy 3 Promotion. Spicy & Tasty Chilli Biltong packs.',
    prices: { 300: 85.00 },
    category: 'specialty',
    flavors: ['Chilli'],
    image: '/images/chilli_deal.jpg'
  },
  {
    id: 'sub-pack-monthly',
    name: 'Monthly Subscription Box',
    description: 'A curated selection of premium biltong, droëwors, and snacks delivered monthly.',
    prices: { 1000: 699.00 },
    category: 'specialty',
    flavors: ['Mixed Cures', 'Original Only', 'Chilli Only'],
    image: '/images/subscription_promo.jpg'
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
