// src/app/edit-animal/edit-animal.component.ts

import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { AnimalsService } from '../../../../core/services/animals.service';
import { FarmService } from '../../../../core/services/farm.service';
import { DocumentService, UploadProgress } from '../../../../core/services/document.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Animal } from '../../../../shared/models/animal.model';
import { Farm } from '../../../../shared/models/farm.model';
import { FarmMovement } from '../../../../shared/models/farm-movement.model';
import { SireService } from '../../../../core/services/sire.service';
import { Sire } from '../../../../shared/models/sire.model';
import {
  AnimalDocument,
  DocumentType,
  DOCUMENT_TYPE_LABELS,
  ALLOWED_FILE_TYPES
} from '../../../../shared/models/document.model';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import { getReproductiveStatusOptions } from '../../../../shared/utils/gestation-period.util';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-edit-animal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  providers: [AnimalsService],
  templateUrl: './edit-animal.component.html',
  styleUrl: './edit-animal.component.scss'
})
export class EditAnimalComponent implements OnInit {
  animal: Animal | undefined;
  dobString: string = '';
  farms: Farm[] = [];
  previousFarmId: string | undefined;
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  movementHistory: FarmMovement[] = [];
  currentFarm: Farm | null = null;
  showTransferDialog: boolean = false;
  transferDestinationFarmId: string = '';
  transferReason: string = '';
  transferNotes: string = '';
  reproductiveStatusOptions: Array<{value: string, label: string}> = [];

  // Document upload properties
  documents: AnimalDocument[] = [];
  isUploading: boolean = false;
  uploadProgress: number = 0;
  uploadError: string = '';
  selectedDocumentType: DocumentType = 'other';
  documentDescription: string = '';
  documentTypeOptions = DOCUMENT_TYPE_LABELS;
  acceptedFileTypes = ALLOWED_FILE_TYPES.join(',');

  // Image upload properties
  isUploadingImage: boolean = false;
  imageUploadProgress: number = 0;
  imageUploadError: string = '';

  // Bloodline/Parent selection
  potentialSires: Animal[] = [];
  potentialDams: Animal[] = [];
  sire: Animal | undefined;
  dam: Animal | undefined;

  // Registry sires (from Bulls/Sire/Buck registry)
  registrySires: Sire[] = [];

  constructor(
    private animalsService: AnimalsService,
    private farmService: FarmService,
    private documentService: DocumentService,
    private sireService: SireService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // Load farms
    this.farmService.getAllFarms().subscribe({
      next: (farms) => {
        this.farms = farms;
      },
      error: (error) => {
        console.error('Error loading farms:', error);
      }
    });

    // Load potential parents for bloodline selection
    this.animalsService.getPotentialSires().subscribe({
      next: (sires) => this.potentialSires = sires,
      error: (error) => console.error('Error loading sires:', error)
    });

    this.animalsService.getPotentialDams().subscribe({
      next: (dams) => this.potentialDams = dams,
      error: (error) => console.error('Error loading dams:', error)
    });

    // Load animal
    const animalId = this.route.snapshot.paramMap.get('id');
    if (animalId) {
      this.animalsService.getAnimal(animalId)
        .subscribe(animal => {
          this.animal = animal;
          this.previousFarmId = animal?.currentFarmId;
          // Convert dob to string format for the date input
          if (animal?.dob) {
            this.dobString = this.convertToDateString(animal.dob);
          }

          // Update reproductive status options based on animal's sex
          if (animal?.sex) {
            this.reproductiveStatusOptions = getReproductiveStatusOptions(animal.sex);
          }

          // Load registry sires filtered by animal's species
          if (animal?.species) {
            this.loadRegistrySires(animal.species);
          }

          // Load current farm details
          if (animal?.currentFarmId) {
            this.farmService.getFarmById(animal.currentFarmId).subscribe({
              next: (farm) => {
                this.currentFarm = farm;
              },
              error: (error) => {
                console.error('Error loading current farm:', error);
              }
            });
          }

          // Load parent details for bloodline display
          if (animal?.sireId) {
            this.animalsService.getAnimal(animal.sireId).subscribe({
              next: (sire) => this.sire = sire,
              error: (error) => console.error('Error loading sire:', error)
            });
          }
          if (animal?.damId) {
            this.animalsService.getAnimal(animal.damId).subscribe({
              next: (dam) => this.dam = dam,
              error: (error) => console.error('Error loading dam:', error)
            });
          }

          // Load movement history
          this.farmService.getAnimalMovementHistory(animalId).subscribe({
            next: (movements) => {
              this.movementHistory = movements;
            },
            error: (error) => {
              console.error('Error loading movement history:', error);
            }
          });

          // Load documents
          this.loadDocuments(animalId);
        });
    }

    // Subscribe to upload progress
    this.documentService.getUploadProgress().subscribe({
      next: (progress) => {
        this.uploadProgress = progress.progress;
        if (progress.state === 'success' || progress.state === 'error') {
          this.isUploading = false;
        }
      }
    });
  }

  onSexChange(event: any): void {
    const sex = event.target.value as 'male' | 'female';
    this.reproductiveStatusOptions = getReproductiveStatusOptions(sex);
    // Reset reproductive status when sex changes
    if (this.animal) {
      this.animal.reproductiveStatus = 'unknown';
    }
  }

  loadRegistrySires(species: string): void {
    this.sireService.getSiresBySpecies(species).subscribe({
      next: (sires) => {
        // Only show active sires
        this.registrySires = sires.filter(s => s.status === 'active');
      },
      error: (error) => console.error('Error loading registry sires:', error)
    });
  }

  onSpeciesChange(): void {
    // Reload sires when species changes
    if (this.animal?.species) {
      this.loadRegistrySires(this.animal.species);
      // Clear current sire selection since it may not match the new species
      this.animal.sireId = undefined;
    }
  }

  getSourceLabel(source: string): string {
    switch (source) {
      case 'ai': return 'AI';
      case 'leased': return 'Leased';
      case 'owned': return 'Owned';
      default: return source;
    }
  }

  // Helper method to convert Timestamp or string to yyyy-MM-dd format
  convertToDateString(dob: string | Timestamp): string {
    if (typeof dob === 'string') {
      return dob;
    } else if (dob instanceof Timestamp) {
      const date = dob.toDate();
      return date.toISOString().split('T')[0];
    }
    return '';
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.animal?.id) {
      return;
    }

    const updatedAnimal: Animal = {
      ...this.animal, // Spread the existing properties
      name: form.value.name,
      species: form.value.species,
      breed: form.value.breed,
      dob: this.dobString, // Use the dobString which is in yyyy-MM-dd format
      sex: form.value.sex,
      status: form.value.status,
      reproductiveStatus: form.value.reproductiveStatus || 'unknown',
      currentFarmId: form.value.currentFarmId || undefined,
      sireId: form.value.sireId || undefined,
      damId: form.value.damId || undefined,
    };

    // Check if farm changed
    const farmChanged = this.previousFarmId !== form.value.currentFarmId;

    this.animalsService.updateAnimal(updatedAnimal)
      .subscribe({
        next: () => {
          // If farm changed, create movement record
          if (farmChanged && form.value.currentFarmId) {
            this.farmService.moveAnimalToFarm(
              this.animal!.id!,
              this.previousFarmId || null,
              form.value.currentFarmId,
              'Farm Assignment Change',
              'Updated via animal edit form'
            ).subscribe({
              next: () => {
                const farmName = this.farms.find(f => f.id === form.value.currentFarmId)?.name || 'selected farm';
                this.previousFarmId = form.value.currentFarmId;
                this.toastService.success(`Animal updated and moved to ${farmName}`);

                // Reload current farm details
                this.farmService.getFarmById(form.value.currentFarmId).subscribe({
                  next: (farm) => this.currentFarm = farm,
                  error: (error) => console.error('Error loading current farm:', error)
                });

                // Reload movement history
                this.farmService.getAnimalMovementHistory(this.animal!.id!).subscribe({
                  next: (movements) => this.movementHistory = movements,
                  error: (error) => console.error('Error loading movement history:', error)
                });
              },
              error: (error) => {
                console.error('Error creating movement record:', error);
                this.toastService.error('Animal updated but failed to record farm movement');
              }
            });
          } else {
            this.toastService.success('Animal updated successfully');
          }
        },
        error: (error) => {
          console.error('Error updating animal:', error);
          this.toastService.error('Error updating animal. Please try again.');
        }
      });
  }
  openTransferDialog(): void {
    this.showTransferDialog = true;
    this.transferDestinationFarmId = '';
    this.transferReason = '';
    this.transferNotes = '';
  }

  closeTransferDialog(): void {
    this.showTransferDialog = false;
  }

  confirmTransfer(): void {
    if (!this.animal?.id || !this.transferDestinationFarmId) {
      return;
    }

    this.farmService.moveAnimalToFarm(
      this.animal.id,
      this.animal.currentFarmId || null,
      this.transferDestinationFarmId,
      this.transferReason || undefined,
      this.transferNotes || undefined
    ).subscribe({
      next: () => {
        const farmName = this.farms.find(f => f.id === this.transferDestinationFarmId)?.name || 'selected farm';
        this.successMessage = `Animal transferred to ${farmName}`;
        this.showSuccessMessage = true;
        this.showTransferDialog = false;

        // Reload data
        if (this.animal?.id) {
          this.animalsService.getAnimal(this.animal.id).subscribe(animal => {
            this.animal = animal;
            this.previousFarmId = animal?.currentFarmId;

            // Reload current farm
            if (animal?.currentFarmId) {
              this.farmService.getFarmById(animal.currentFarmId).subscribe(farm => {
                this.currentFarm = farm;
              });
            } else {
              this.currentFarm = null;
            }

            // Reload movement history
            this.farmService.getAnimalMovementHistory(this.animal!.id!).subscribe(movements => {
              this.movementHistory = movements;
            });
          });
        }

        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error transferring animal:', error);
        this.toastService.error('Error transferring animal. Please try again.');
      }
    });
  }

  getMovementDateAssigned(): string {
    if (this.movementHistory.length > 0) {
      const latestMovement = this.movementHistory[0];
      return latestMovement.movementDate.toString();
    }
    return 'Unknown';
  }

  // Document Management Methods
  loadDocuments(animalId: string): void {
    this.documentService.getDocumentsByAnimalId(animalId).subscribe({
      next: (documents) => {
        this.documents = documents;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.uploadFile(file);

    // Reset the input so the same file can be selected again
    input.value = '';
  }

  uploadFile(file: File): void {
    if (!this.animal?.id || !this.animal?.tenantId) {
      this.uploadError = 'Animal information not loaded. Please try again.';
      return;
    }

    // Validate file
    const validation = this.documentService.validateFile(file);
    if (!validation.valid) {
      this.uploadError = validation.error || 'Invalid file';
      return;
    }

    this.isUploading = true;
    this.uploadError = '';
    this.uploadProgress = 0;

    this.documentService.uploadDocument(
      file,
      this.animal.id,
      this.animal.tenantId,
      this.selectedDocumentType,
      this.documentDescription
    ).subscribe({
      next: (document) => {
        this.documents = [...this.documents, document];
        this.isUploading = false;
        this.uploadProgress = 0;
        this.documentDescription = '';
        this.selectedDocumentType = 'other';
        this.successMessage = 'Document uploaded successfully!';
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error uploading document:', error);
        this.uploadError = error.message || 'Error uploading document. Please try again.';
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    });
  }

  deleteDocument(document: AnimalDocument): void {
    if (!confirm(`Are you sure you want to delete "${document.originalName}"?`)) {
      return;
    }

    this.documentService.deleteDocument(document).subscribe({
      next: () => {
        this.documents = this.documents.filter(d => d.id !== document.id);
        this.successMessage = 'Document deleted successfully!';
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error deleting document:', error);
        this.toastService.error('Error deleting document. Please try again.');
      }
    });
  }

  getFileIcon(fileType: string): string {
    return this.documentService.getFileIcon(fileType);
  }

  formatFileSize(bytes: number): string {
    return this.documentService.formatFileSize(bytes);
  }

  getDocumentTypeLabel(type: DocumentType | undefined): string {
    if (!type) return 'Other';
    return DOCUMENT_TYPE_LABELS[type] || 'Other';
  }

  getDocumentTypeKeys(): DocumentType[] {
    return Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[];
  }

  // Image Upload Methods
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.uploadImage(file);
    input.value = '';
  }

  uploadImage(file: File): void {
    if (!this.animal?.id || !this.animal?.tenantId) {
      this.imageUploadError = 'Animal information not loaded. Please try again.';
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.imageUploadError = 'Please select an image file (JPG, PNG, GIF, etc.)';
      return;
    }

    this.isUploadingImage = true;
    this.imageUploadError = '';
    this.imageUploadProgress = 0;

    // Delete old image if exists
    const oldImagePath = this.animal.imageStoragePath;

    this.documentService.uploadAnimalImage(
      file,
      this.animal.id,
      this.animal.tenantId
    ).subscribe({
      next: (result) => {
        // Update animal with new image URL
        if (this.animal) {
          this.animal.imageUrl = result.downloadUrl;
          this.animal.imageStoragePath = result.storagePath;

          // Save to database
          this.animalsService.updateAnimal(this.animal).subscribe({
            next: () => {
              this.isUploadingImage = false;
              this.imageUploadProgress = 0;
              this.successMessage = 'Image uploaded successfully!';
              this.showSuccessMessage = true;

              // Delete old image if it existed
              if (oldImagePath) {
                this.documentService.deleteAnimalImage(oldImagePath).subscribe();
              }

              setTimeout(() => {
                this.showSuccessMessage = false;
              }, 3000);
            },
            error: (error) => {
              console.error('Error saving image URL:', error);
              this.imageUploadError = 'Error saving image. Please try again.';
              this.isUploadingImage = false;
            }
          });
        }
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.imageUploadError = error.message || 'Error uploading image. Please try again.';
        this.isUploadingImage = false;
        this.imageUploadProgress = 0;
      }
    });
  }

  removeImage(): void {
    if (!this.animal?.imageStoragePath || !confirm('Are you sure you want to remove this image?')) {
      return;
    }

    const storagePath = this.animal.imageStoragePath;

    this.documentService.deleteAnimalImage(storagePath).subscribe({
      next: () => {
        if (this.animal) {
          this.animal.imageUrl = undefined;
          this.animal.imageStoragePath = undefined;

          this.animalsService.updateAnimal(this.animal).subscribe({
            next: () => {
              this.successMessage = 'Image removed successfully!';
              this.showSuccessMessage = true;
              setTimeout(() => {
                this.showSuccessMessage = false;
              }, 3000);
            },
            error: (error) => {
              console.error('Error updating animal:', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error deleting image:', error);
        this.toastService.error('Error removing image. Please try again.');
      }
    });
  }

  onDeleteAnimal(): void {
    if (!this.animal?.id) {
      return;
    }

    const confirmMessage = `Are you sure you want to delete "${this.animal.name}"?\n\nThis will permanently delete the animal and all associated records (health, breeding, etc.). This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.animalsService.deleteAnimal(this.animal).subscribe({
      next: () => {
        this.toastService.success('Animal deleted successfully');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error deleting animal:', error);
        this.toastService.error('Error deleting animal. Please try again.');
      }
    });
  }
}