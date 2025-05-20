// src/app/video-form/video-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // RouterModule importálása a navigációhoz
import { VideoService } from '../services/video.services';
import { CreateVideoDTO, UpdateVideoDTO, VideoDTO } from '../model'; // Feltételezve, hogy a DTO-k itt vannak

@Component({
  selector: 'app-video-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule // RouterModule hozzáadása
  ],
  templateUrl: './video-form.component.html',
  styleUrls: ['./video-form.component.css']
})
export class VideoFormComponent implements OnInit {
  videoForm!: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isEditMode = false;
  videoIdToEdit: number | null = null;

  private fb = inject(FormBuilder);
  private videoService = inject(VideoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() { }

  ngOnInit(): void {
    this.videoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      director: ['', [Validators.required, Validators.minLength(3)]],
      status: ['szabad', Validators.required], // Alapértelmezett státusz
      acquisitionDate: [''], // Opcionális
      serialNumber: ['']      // Opcionális
    });

    // Ellenőrizzük, hogy szerkesztő módban vagyunk-e (az URL alapján)
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.videoIdToEdit = +id; // '+' konvertálja stringből number-ré
        this.loadVideoData(this.videoIdToEdit);
      }
    });
  }

  loadVideoData(id: number): void {
    this.isLoading = true;
    this.videoService.getVideoById(id).subscribe({
      next: (video) => {
        this.videoForm.patchValue({
          title: video.title,
          director: video.director,
          status: video.status,
          acquisitionDate: video.acquisitionDate ? video.acquisitionDate.split('T')[0] : '', // Dátum formázása YYYY-MM-DD-re
          serialNumber: video.serialNumber
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = `Hiba a videó adatainak betöltésekor: ${err.message}`;
      }
    });
  }

  get title() { return this.videoForm.get('title'); }
  get director() { return this.videoForm.get('director'); }
  get status() { return this.videoForm.get('status'); }
  // acquisitionDate és serialNumber getterek opcionálisak, ha nem jelenítünk meg rájuk specifikus hibát

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.videoForm.invalid) {
      this.videoForm.markAllAsTouched();
      this.errorMessage = 'Kérjük, javítsa a hibákat az űrlapon!';
      return;
    }

    this.isLoading = true;
    const videoData = this.videoForm.value;

    if (this.isEditMode && this.videoIdToEdit !== null) {
      // Szerkesztés
      const updateData: UpdateVideoDTO = { ...videoData };
      // Biztosítjuk, hogy a null értékek ne kerüljenek bele, ha üresen hagyták az opcionális mezőket
      if (!updateData.acquisitionDate) delete updateData.acquisitionDate;
      if (!updateData.serialNumber) delete updateData.serialNumber;

      this.videoService.updateVideo(this.videoIdToEdit, updateData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = `Videó sikeresen frissítve! ID: ${response.id}`;
          // Opcionálisan navigálhatunk a videók listájára vagy a szerkesztett videó részleteihez
          // this.router.navigate(['/videos']); // Példa navigáció
        },
        error: (err) => this.handleError(err, 'frissítésekor')
      });
    } else {
      // Létrehozás
      const createData: CreateVideoDTO = { ...videoData };
      if (!createData.acquisitionDate) delete createData.acquisitionDate; // Ha üres, ne küldjük
      if (!createData.serialNumber) delete createData.serialNumber;   // Ha üres, ne küldjük

      this.videoService.createVideo(createData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = `Videó sikeresen létrehozva! ID: ${response.id}`;
          this.videoForm.reset({ status: 'szabad' }); // Alapértelmezett státusz visszaállítása
        },
        error: (err) => this.handleError(err, 'létrehozásakor')
      });
    }
  }

  private handleError(err: any, action: string): void {
    this.isLoading = false;
    let detail = 'Ismeretlen szerverhiba';
    if (err.error && typeof err.error.message === 'string') {
        detail = err.error.message;
    } else if (typeof err.message === 'string') {
        detail = err.message;
    }
    this.errorMessage = `Hiba történt a videó ${action}: ${detail}`;
    console.error(`Hiba a videó ${action}:`, err);
  }
}
