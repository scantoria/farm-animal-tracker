// src/app/shared/components/toast/toast.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from './toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts"
        class="toast"
        [ngClass]="'toast-' + toast.type"
        (click)="dismiss(toast.id)"
      >
        <div class="toast-icon">
          <i class="bi" [ngClass]="getIcon(toast.type)"></i>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" (click)="dismiss(toast.id); $event.stopPropagation()">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease;
      cursor: pointer;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .toast:hover {
      transform: translateX(-4px);
    }

    .toast-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-size: 0.9375rem;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.2s ease;
    }

    .toast-close:hover {
      opacity: 1;
    }

    .toast-success {
      border-left: 4px solid #22c55e;
    }
    .toast-success .toast-icon {
      color: #22c55e;
    }

    .toast-error {
      border-left: 4px solid #ef4444;
    }
    .toast-error .toast-icon {
      color: #ef4444;
    }

    .toast-warning {
      border-left: 4px solid #f59e0b;
    }
    .toast-warning .toast-icon {
      color: #f59e0b;
    }

    .toast-info {
      border-left: 4px solid #3b82f6;
    }
    .toast-info .toast-icon {
      color: #3b82f6;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.getToasts().subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  getIcon(type: Toast['type']): string {
    switch (type) {
      case 'success': return 'bi-check-circle-fill';
      case 'error': return 'bi-exclamation-circle-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      case 'info': return 'bi-info-circle-fill';
      default: return 'bi-info-circle-fill';
    }
  }
}
