// src/app/services/rental.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { RentalDTO, CreateRentalDTO, VideoDTO, ApiResponseWithMessage } from '../model'; // Vagy '../models'

@Injectable({
  providedIn: 'root'
})
export class RentalService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/rentals'; // Backend API URL a kölcsönzésekhez

  constructor() { }

  // Összes kölcsönzés lekérése, opcionális szűréssel
  getRentals(filterParams?: { customerId?: number; videoId?: number; status?: string }): Observable<RentalDTO[]> {
    let params = new HttpParams();
    if (filterParams) {
      if (filterParams.customerId) params = params.set('customerId', filterParams.customerId.toString());
      if (filterParams.videoId) params = params.set('videoId', filterParams.videoId.toString());
      if (filterParams.status) params = params.set('status', filterParams.status);
    }
    console.log('Kölcsönzések lekérése a service-ből, szűrők:', filterParams);
    return this.http.get<RentalDTO[]>(this.apiUrl, { params })
      .pipe(
        tap(data => console.log('Kapott kölcsönzések:', data)),
        catchError(this.handleError)
      );
  }

  // Egy kölcsönzés lekérése ID alapján
  getRentalById(id: number): Observable<RentalDTO> {
    return this.http.get<RentalDTO>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(data => console.log(`Kölcsönzés (ID: ${id}) adatai:`, data)),
        catchError(this.handleError)
      );
  }

  // Új kölcsönzés létrehozása
  // A backend válasza tartalmazza a létrehozott kölcsönzést és a frissített videó státuszát is.
  createRental(rentalData: CreateRentalDTO): Observable<{ message: string, rental: RentalDTO, video: VideoDTO }> {
    return this.http.post<{ message: string, rental: RentalDTO, video: VideoDTO }>(this.apiUrl, rentalData)
      .pipe(
        tap(data => console.log('Létrehozott kölcsönzés:', data)),
        catchError(this.handleError)
      );
  }

  // Videó visszahozatala (kölcsönzés státuszának frissítése)
  // A backend válasza tartalmazza a frissített kölcsönzést és a videó frissített státuszát.
  returnRental(id: number): Observable<{ message: string, rental: RentalDTO, video: VideoDTO }> {
    return this.http.put<{ message: string, rental: RentalDTO, video: VideoDTO }>(`${this.apiUrl}/${id}/return`, {}) // A PUT kéréshez itt nem küldünk body-t
      .pipe(
        tap(data => console.log(`Kölcsönzés (ID: ${id}) visszahozva:`, data)),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ismeretlen hiba történt!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Hiba: ${error.error.message}`;
    } else {
      errorMessage = `Szerverhiba - Kód: ${error.status}, Üzenet: ${error.message}`;
      if (error.error && typeof error.error === 'string') {
        errorMessage += ` Részletek: ${error.error}`;
      } else if (error.error && error.error.message) {
        errorMessage += ` Részletek: ${error.error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
