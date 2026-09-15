import { create } from 'zustand';
import { Order } from '@/types';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  
  setOrders: (orders: Order[]) => void;
  setSelectedOrder: (order: Order | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateOrder: (order: Order) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  
  setOrders: (orders) => set({ orders }),
  setSelectedOrder: (selectedOrder) => set({ selectedOrder }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  updateOrder: (order) => set((state) => ({
    orders: state.orders.map((o) => (o.id === order.id ? order : o)),
  })),
}));
