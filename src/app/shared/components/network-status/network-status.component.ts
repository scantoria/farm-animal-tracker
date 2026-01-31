import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkStatusService } from '../../../core/services/network-status.service';

@Component({
  selector: 'app-network-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!networkStatus.online()) {
      <div class="offline-banner">
        <span class="offline-icon">📡</span>
        <span>You're offline. Changes will sync when reconnected.</span>
      </div>
    }
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #ff9800;
      color: white;
      padding: 12px;
      text-align: center;
      z-index: 9999;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .offline-icon {
      margin-right: 8px;
      font-size: 18px;
    }
  `]
})
export class NetworkStatusComponent {
  networkStatus = inject(NetworkStatusService);
}
