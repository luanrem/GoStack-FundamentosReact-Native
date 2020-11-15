import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const loadedCart = await AsyncStorage.getItem('@GoMarket:Cart');
      setProducts(JSON.parse(loadedCart));
      console.log('Itens no Async Storage', loadedCart);
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      console.log('Chamou o increment', id);

      const productIncremented = products.map(item => {
        if (item.id === id) {
          item.quantity += 1;
        }
        return item;
      });

      setProducts(productIncremented);
      await AsyncStorage.setItem('@GoMarket:Cart', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // console.log('Chamou o decrement', id);

      const productDecremented = products.map(item => {
        if (item.id === id) {
          if (item.quantity > 0) {
            item.quantity -= 1;
          }
        }
        return item;
      });

      // const productLessThanZero = products.map(item => {
      //   if (item.quantity)
      // })

      setProducts(productDecremented);
      await AsyncStorage.setItem('@GoMarket:Cart', JSON.stringify(products));
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productIsOnCart = products.find(element => {
        return element.id === product.id;
      });
      // console.log('productIsOnCart', productIsOnCart);

      if (!productIsOnCart) {
        // console.log('nao encontrou e adicionou um com quantity');

        const productWithQuantity = {
          id: product.id,
          image_url: product.image_url,
          price: product.price,
          title: product.title,
          quantity: 1,
        };
        // console.log(productWithQuantity);
        setProducts([...products, productWithQuantity]);
        await AsyncStorage.setItem('@GoMarket:Cart', JSON.stringify(products));
      } else {
        // console.log('encontrou');

        increment(productIsOnCart.id);
      }
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
