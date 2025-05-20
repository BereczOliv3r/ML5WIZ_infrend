// src/app/services/video.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { VideoDTO, CreateVideoDTO, UpdateVideoDTO } from '../model'; // Vagy '../models'

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  // Az inject funkció használata a HttpClient példányosítására (modern Angular megközelítés)
  private http = inject(HttpClient);
  // A backend API alap URL-je a videókhoz
  private apiUrl = 'http://localhost:3000/api/videos'; // Győződj meg róla, hogy ez a backend címed!

  constructor() { }

  // Összes videó lekérése
  getVideos(): Observable<VideoDTO[]> {
    console.log('Videók lekérése a service-ből...');
    return this.http.get<VideoDTO[]>(this.apiUrl)
      .pipe(
        tap(data => console.log('Kapott videók:', data)), // Opcionális: logolás a válaszról
        catchError(this.handleError) // Hibakezelés
      );
  }

  // Egy videó lekérése ID alapján
  getVideoById(id: number): Observable<VideoDTO> {
    return this.http.get<VideoDTO>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(data => console.log(`Videó (ID: ${id}) adatai:`, data)),
        catchError(this.handleError)
      );
  }

  // Új videó létrehozása
  createVideo(videoData: CreateVideoDTO): Observable<VideoDTO> {
    return this.http.post<VideoDTO>(this.apiUrl, videoData)
      .pipe(
        tap(data => console.log('Létrehozott videó:', data)),
        catchError(this.handleError)
      );
  }

  // Videó frissítése
  updateVideo(id: number, videoData: UpdateVideoDTO): Observable<VideoDTO> {
    return this.http.put<VideoDTO>(`${this.apiUrl}/${id}`, videoData)
      .pipe(
        tap(data => console.log(`Frissített videó (ID: ${id}):`, data)),
        catchError(this.handleError)
      );
  }

  // Videó "selejtezése" (státuszváltás)
  // A backend DELETE végpontja valójában státuszt vált, és visszaadja a frissített videót.
  deleteVideo(id: number): Observable<{ message: string, video: VideoDTO }> {
    return this.http.delete<{ message: string, video: VideoDTO }>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(data => console.log(`Videó (ID: ${id}) selejtezve:`, data)),
        catchError(this.handleError)
      );
  }

  // Egyszerű hibakezelő függvény
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ismeretlen hiba történt!';
    if (error.error instanceof ErrorEvent) {
      // Kliensoldali vagy hálózati hiba
      errorMessage = `Hiba: ${error.error.message}`;
    } else {
      // A backend hibakódot és esetleg hibaüzenetet küldött vissza
      errorMessage = `Szerverhiba - Kód: ${error.status}, Üzenet: ${error.message}`;
      if (error.error && typeof error.error === 'string') {
        errorMessage += ` Részletek: ${error.error}`;
      } else if (error.error && error.error.message) {
        errorMessage += ` Részletek: ${error.error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage)); // Observable hibaként továbbítjuk
  }
}
