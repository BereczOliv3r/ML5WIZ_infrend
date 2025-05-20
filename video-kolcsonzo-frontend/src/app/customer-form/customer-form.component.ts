// src/app/customer-form/customer-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CustomerService } from '../services/customer.service'; // Ellenőrizd az útvonalat!
// Javított import, feltételezve, hogy a DTO-k a src/app/model.ts fájlban vannak:
import { CreateCustomerDTO } from '../model'; // Korábban '../types' volt

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css'] // Vagy .scss
})
export class CustomerFormComponent implements OnInit {
  customerForm!: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);

  constructor() { }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]],
      idCardNumber: ['', [Validators.required, Validators.minLength(6)]],
      address: ['', Validators.required]
    });
  }

  get name() { return this.customerForm.get('name'); }
  get phone() { return this.customerForm.get('phone'); }
  get idCardNumber() { return this.customerForm.get('idCardNumber'); }
  get address() { return this.customerForm.get('address'); }

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      this.errorMessage = 'Kérjük, javítsa a hibákat az űrlapon!';
      return;
    }

    this.isLoading = true;
    const customerData: CreateCustomerDTO = this.customerForm.value;

    this.customerService.createCustomer(customerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Ügyfél sikeresen létrehozva! ID: ${response.id}`;
        this.customerForm.reset();
      },
      error: (err) => {
        this.isLoading = false;
        let detail = 'Ismeretlen szerverhiba';
        if (err.error && typeof err.error.message === 'string') {
            detail = err.error.message;
        } else if (typeof err.message === 'string') {
            detail = err.message;
        }
        this.errorMessage = `Hiba történt az ügyfél létrehozásakor: ${detail}`;
        console.error('Hiba az ügyfél létrehozásakor:', err);
      }
    });
  }
}


