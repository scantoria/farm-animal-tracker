import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './providers.component.html',
  styleUrl: './providers.component.scss'
})
export class ProvidersComponent {
  // Define the types of providers and their corresponding admin routes
  providerModules = [
    {
      name: 'Blacksmiths',
      description: 'Manage farriers and hoof care professionals.',
      icon: '⚙️',
      route: '/admin/blacksmiths',
      status: 'Active'
    },
    {
      name: 'Veterinarians',
      description: 'Manage veterinary clinics and doctors.',
      icon: '🩺',
      route: '/admin/veterinarian',
      status: 'Active'
    },
    {
      name: 'Feed Suppliers',
      description: 'Manage feed stores and suppliers.',
      icon: '🌾',
      route: '/admin/feed-suppliers',
      status: 'Active'
    },
    {
      name: 'Farms',
      description: 'Manage farm locations and facilities.',
      icon: '🏡',
      route: '/farms',
      status: 'Active'
    },
    // Add other provider types here (e.g., Farm Managers, etc.)
  ];

  constructor(private router: Router) { }

  // Method to handle navigation if needed, though RouterModule handles the links
  goToModule(route: string, status: string) {
    if (status === 'Active') {
        this.router.navigate([route]);
    } else {
        alert(`The ${route} module is a placeholder and not yet implemented.`);
    }
  }
}