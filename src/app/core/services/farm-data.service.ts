// src/app/core/services/farm-data.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Farm } from '../../shared/models/farm.model';
import { FarmService } from './farm.service';

@Injectable({
  providedIn: 'root'
})
export class FarmDataService {

  constructor(private farmService: FarmService) { }

  /**
   * Get all farms for the current tenant
   */
  getAllFarms(): Observable<Farm[]> {
    return this.farmService.getAllFarms();
  }

  /**
   * Get a single farm by ID
   */
  getFarmById(farmId: string): Observable<Farm | null> {
    return this.farmService.getFarmById(farmId);
  }

  /**
   * Create a new farm
   */
  createFarm(farm: Partial<Farm>): Observable<string> {
    return this.farmService.createFarm(farm);
  }

  /**
   * Update an existing farm
   */
  updateFarm(farmId: string, updates: Partial<Farm>): Observable<void> {
    return this.farmService.updateFarm(farmId, updates);
  }

  /**
   * Delete (soft delete) a farm
   */
  deleteFarm(farmId: string): Observable<void> {
    return this.farmService.deleteFarm(farmId);
  }
}