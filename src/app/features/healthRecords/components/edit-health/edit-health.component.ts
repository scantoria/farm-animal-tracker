import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HealthService } from '../../../../core/services/health.service';
import { HealthModel, HealthRecordDocument, HEALTH_EVENT_TYPES } from '../../../../shared/models/health.model';
import { AnimalsService } from '../../../../core/services/animals.service';
import { DocumentService } from '../../../../core/services/document.service';
import { Animal } from '../../../../shared/models/animal.model';
import { Castration, CASTRATION_METHODS } from '../../../../shared/models/castration.model';
import { Dehorning, DEHORNING_METHODS } from '../../../../shared/models/dehorning.model';
import { ALLOWED_FILE_TYPES } from '../../../../shared/models/document.model';
import { take } from 'rxjs/operators';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from '@angular/fire/firestore';


@Component({
  selector: 'app-edit-health',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './edit-health.component.html',
  styleUrls: ['./edit-health.component.scss'],
})
export class EditHealthComponent implements OnInit {
  editHealthRecordForm!: FormGroup;
  recordId!: string;
  animalId!: string;
  animalName: string = '';
  selectedEventType: string = '';
  tenantId: string = '';

  // Constants for dropdowns
  healthEventTypes = HEALTH_EVENT_TYPES;
  castrationMethods = CASTRATION_METHODS;
  dehorningMethods = DEHORNING_METHODS;

  // Document upload properties
  documents: HealthRecordDocument[] = [];
  isUploading = false;
  uploadProgress = 0;
  uploadError = '';
  documentDescription = '';
  acceptedFileTypes = ALLOWED_FILE_TYPES.join(',');
  successMessage = '';
  showSuccessMessage = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private healthService: HealthService,
    private animalsService: AnimalsService,
    private documentService: DocumentService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.recordId = this.route.snapshot.paramMap.get('recordId')!;
    this.tenantId = this.auth.currentUser?.uid || 'default-tenant';

    // Subscribe to upload progress
    this.documentService.getUploadProgress().subscribe({
      next: (progress) => {
        this.uploadProgress = progress.progress;
        if (progress.state === 'success' || progress.state === 'error') {
          this.isUploading = false;
        }
      }
    });

    this.editHealthRecordForm = this.fb.group({
      date: ['', Validators.required],
      eventType: ['', Validators.required],
      description: ['', Validators.required],
      administeredBy: [''],
      dosage: [''],
      // Castration fields
      castrationMethod: [''],
      ageAtCastration: [''],
      essentialTiming: [false],
      castrationComplications: [false],
      castrationRecoveryNotes: [''],
      // Dehorning fields
      dehorningMethod: [''],
      ageAtDehorning: [''],
      dehorningComplications: [false],
      dehorningRecoveryNotes: ['']
    });

    // Subscribe to event type changes
    this.editHealthRecordForm.get('eventType')?.valueChanges.subscribe(value => {
      this.selectedEventType = value;
      this.updateConditionalValidators();
    });

    if (this.animalId && this.recordId) {
      this.loadAnimalInfo();
      this.healthService
        .getHealthRecord(this.animalId, this.recordId)
        .pipe(take(1))
        .subscribe((record: HealthModel) => {
          if (record) {
            this.editHealthRecordForm.patchValue(record);
            this.selectedEventType = record.eventType;
            this.updateConditionalValidators();
            // Load existing documents
            this.documents = record.documents || [];
          }
        });
    }
  }

  updateConditionalValidators() {
    const castrationMethodControl = this.editHealthRecordForm.get('castrationMethod');
    const ageAtCastrationControl = this.editHealthRecordForm.get('ageAtCastration');
    const dehorningMethodControl = this.editHealthRecordForm.get('dehorningMethod');
    const ageAtDehorningControl = this.editHealthRecordForm.get('ageAtDehorning');

    if (this.isCastration()) {
      castrationMethodControl?.setValidators([Validators.required]);
      ageAtCastrationControl?.setValidators([Validators.required]);
      dehorningMethodControl?.clearValidators();
      ageAtDehorningControl?.clearValidators();
    } else if (this.isDehorning()) {
      dehorningMethodControl?.setValidators([Validators.required]);
      ageAtDehorningControl?.setValidators([Validators.required]);
      castrationMethodControl?.clearValidators();
      ageAtCastrationControl?.clearValidators();
    } else {
      castrationMethodControl?.clearValidators();
      ageAtCastrationControl?.clearValidators();
      dehorningMethodControl?.clearValidators();
      ageAtDehorningControl?.clearValidators();
    }

    castrationMethodControl?.updateValueAndValidity();
    ageAtCastrationControl?.updateValueAndValidity();
    dehorningMethodControl?.updateValueAndValidity();
    ageAtDehorningControl?.updateValueAndValidity();
  }

  isCastration(): boolean {
    return this.selectedEventType === 'castration';
  }

  isDehorning(): boolean {
    return this.selectedEventType === 'dehorning';
  }

  loadAnimalInfo() {
    this.animalsService.getAnimal(this.animalId).subscribe({
      next: (animal: Animal | undefined) => {
        if (animal) {
          this.animalName = animal.name;
        }
      },
      error: (error) => {
        console.error('Error loading animal info:', error);
      }
    });
  }

  onSubmit() {
    if (this.editHealthRecordForm.valid && this.animalId && this.recordId) {
      this.healthService
        .updateHealthRecord(
          this.animalId, 
          this.recordId, 
          this.editHealthRecordForm.value
        )
        .subscribe(() => {
          console.log('Health record updated successfully!');
          this.router.navigate(['/animals', this.animalId, 'health']);
        });
    }
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'health']);
  }

  // Document Management Methods
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.uploadFile(file);
    input.value = '';
  }

  uploadFile(file: File): void {
    // Validate file
    const validation = this.documentService.validateFile(file);
    if (!validation.valid) {
      this.uploadError = validation.error || 'Invalid file';
      return;
    }

    this.isUploading = true;
    this.uploadError = '';
    this.uploadProgress = 0;

    // Generate path for health record documents
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;
    const storagePath = `health-documents/${this.tenantId}/${this.animalId}/${this.recordId}/${fileName}`;

    // Use document service to upload
    this.documentService.uploadHealthDocument(
      file,
      storagePath,
      this.documentDescription
    ).subscribe({
      next: (doc) => {
        this.documents = [...this.documents, doc];
        this.saveDocumentsToRecord();
        this.isUploading = false;
        this.uploadProgress = 0;
        this.documentDescription = '';
        this.showSuccess('Document uploaded successfully!');
      },
      error: (error) => {
        console.error('Error uploading document:', error);
        this.uploadError = error.message || 'Error uploading document. Please try again.';
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    });
  }

  deleteDocument(doc: HealthRecordDocument): void {
    if (!confirm(`Are you sure you want to delete "${doc.originalName}"?`)) {
      return;
    }

    this.documentService.deleteHealthDocument(doc.storagePath).subscribe({
      next: () => {
        this.documents = this.documents.filter(d => d.storagePath !== doc.storagePath);
        this.saveDocumentsToRecord();
        this.showSuccess('Document deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting document:', error);
        alert('Error deleting document. Please try again.');
      }
    });
  }

  saveDocumentsToRecord(): void {
    this.healthService.updateHealthRecord(
      this.animalId,
      this.recordId,
      { documents: this.documents }
    ).subscribe({
      error: (error) => console.error('Error saving documents:', error)
    });
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  getFileIcon(fileType: string): string {
    return this.documentService.getFileIcon(fileType);
  }

  formatFileSize(bytes: number): string {
    return this.documentService.formatFileSize(bytes);
  }
}