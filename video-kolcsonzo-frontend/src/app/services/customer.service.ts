// src/app/services/customer.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CustomerDTO, CreateCustomerDTO, UpdateCustomerDTO, ApiResponseWithMessage } from '../model'; // Vagy '../models'

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/customers'; // Backend API URL az ügyfelekhez

  constructor() { }

  // Összes ügyfél lekérése, opcionális szűréssel
  getCustomers(filterParams?: { name?: string; idCardNumber?: string; id?: number; status?: string }): Observable<CustomerDTO[]> {
    let params = new HttpParams();
    if (filterParams) {
      if (filterParams.name) params = params.set('name', filterParams.name);
      if (filterParams.idCardNumber) params = params.set('idCardNumber', filterParams.idCardNumber);
      if (filterParams.id) params = params.set('id', filterParams.id.toString());
      if (filterParams.status) params = params.set('status', filterParams.status);
    }
    console.log('Ügyfelek lekérése a service-ből, szűrők:', filterParams);
    return this.http.get<CustomerDTO[]>(this.apiUrl, { params })
      .pipe(
        tap(data => console.log('Kapott ügyfelek:', data)),
        catchError(this.handleError)
      );
  }

  // Egy ügyfél lekérése ID alapján
  getCustomerById(id: number): Observable<CustomerDTO> {
    return this.http.get<CustomerDTO>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(data => console.log(`Ügyfél (ID: ${id}) adatai:`, data)),
        catchError(this.handleError)
      );
  }

  // Új ügyfél létrehozása
  createCustomer(customerData: CreateCustomerDTO): Observable<CustomerDTO> {
    return this.http.post<CustomerDTO>(this.apiUrl, customerData)
      .pipe(
        tap(data => console.log('Létrehozott ügyfél:', data)),
        catchError(this.handleError)
      );
  }

  // Ügyfél frissítése
  updateCustomer(id: number, customerData: UpdateCustomerDTO): Observable<CustomerDTO> {
    return this.http.put<CustomerDTO>(`${this.apiUrl}/${id}`, customerData)
      .pipe(
        tap(data => console.log(`Frissített ügyfél (ID: ${id}):`, data)),
        catchError(this.handleError)
      );
  }

  // Ügyfél "törlése" (státuszváltás)
  // A backend DELETE végpontja státuszt vált, és visszaadja a frissített ügyfelet.
  deleteCustomer(id: number): Observable<ApiResponseWithMessage<CustomerDTO>> {
    return this.http.delete<ApiResponseWithMessage<CustomerDTO>>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(data => console.log(`Ügyfél (ID: ${id}) "törölve":`, data)),
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
