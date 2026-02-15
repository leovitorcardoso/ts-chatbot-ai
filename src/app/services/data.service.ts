import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customer_id: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
}

export interface SalesStats {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/api/products`);
  }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/api/customers`);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/api/orders`);
  }

  getSalesStats(): Observable<SalesStats> {
    return this.http.get<SalesStats>(`${this.apiUrl}/api/analytics/stats`);
  }

  // Method to manually refresh all data
  refreshAll(): Observable<any>[] {
    return [
      this.getProducts(),
      this.getCustomers(),
      this.getOrders(),
      this.getSalesStats()
    ];
  }
}
