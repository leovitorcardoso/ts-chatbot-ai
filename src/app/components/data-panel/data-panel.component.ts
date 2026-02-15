import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { DataService, Product, Customer, Order, SalesStats } from '../../services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-data-panel',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    CardModule,
    TagModule,
    SkeletonModule,
    ButtonModule
  ],
  templateUrl: './data-panel.component.html',
  styleUrl: './data-panel.component.css'
})
export class DataPanelComponent implements OnInit, OnDestroy {
  private dataService = inject(DataService);
  private subscriptions = new Subscription();

  products: Product[] = [];
  customers: Customer[] = [];
  orders: Order[] = [];
  stats: SalesStats | null = null;
  
  loading = {
    products: true,
    customers: true,
    orders: true,
    stats: true
  };

  ngOnInit(): void {
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadAllData(): void {
    this.loading = {
      products: true,
      customers: true,
      orders: true,
      stats: true
    };

    this.subscriptions.add(
      this.dataService.getProducts().subscribe({
        next: (data) => {
          this.products = data;
          this.loading.products = false;
        },
        error: () => this.loading.products = false
      })
    );

    this.subscriptions.add(
      this.dataService.getCustomers().subscribe({
        next: (data) => {
          this.customers = data;
          this.loading.customers = false;
        },
        error: () => this.loading.customers = false
      })
    );

    this.subscriptions.add(
      this.dataService.getOrders().subscribe({
        next: (data) => {
          this.orders = data;
          this.loading.orders = false;
        },
        error: () => this.loading.orders = false
      })
    );

    this.subscriptions.add(
      this.dataService.getSalesStats().subscribe({
        next: (data) => {
          this.stats = data;
          this.loading.stats = false;
        },
        error: () => this.loading.stats = false
      })
    );
  }

  refreshData(): void {
    this.loadAllData();
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      'completed': 'success',
      'pending': 'warning',
      'processing': 'info',
      'cancelled': 'danger'
    };
    return severityMap[status.toLowerCase()] || 'info';
  }

  getStockSeverity(stock: number): 'success' | 'warning' | 'danger' {
    if (stock > 50) return 'success';
    if (stock > 20) return 'warning';
    return 'danger';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

