export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Base price for 100g
  category: 'biltong' | 'droewors' | 'snapstix' | 'specialty' | 'game';
  flavors: string[];
  image: string;
  popular?: boolean;
}

export interface CartItem extends Product {
  selectedWeight: number;
  selectedFlavor: string;
  quantity: number;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}
