// src/app/types.ts (vagy src/app/models.ts)

// Videó adatátviteli objektum (DTO)
export interface VideoDTO {
  id: number;
  title: string;
  director: string;
  status: 'szabad' | 'kikölcsönzött' | 'selejtezett';
  acquisitionDate?: string | null;
  serialNumber?: string | null;
  rentals?: RentalDTO[]; // Kapcsolódó kölcsönzések
}

// Ügyfél adatátviteli objektum (DTO)
export interface CustomerDTO {
  id: number;
  name: string;
  phone: string;
  idCardNumber: string;
  address: string;
  status: 'active' | 'deleted' | 'inactive';
  rentals?: RentalDTO[]; // Kapcsolódó kölcsönzések
}

// Kölcsönzés adatátviteli objektum (DTO)
export interface RentalDTO {
  id: number;
  customerId: number;
  videoId: number;
  rentalDate: string; // ISO dátum string
  returnDate?: string | null;
  status: 'rented' | 'returned';
  customer?: CustomerDTO; // Kapcsolódó ügyfél (ha a backend küldi)
  video?: VideoDTO;     // Kapcsolódó videó (ha a backend küldi)
}

// --- Create DTOs ---
export interface CreateVideoDTO {
  title: string;
  director: string;
  status?: 'szabad' | 'kikölcsönzött' | 'selejtezett';
  acquisitionDate?: string | null;
  serialNumber?: string | null;
}

export interface CreateCustomerDTO {
  name: string;
  phone: string;
  idCardNumber: string;
  address: string;
  status?: 'active' | 'deleted' | 'inactive';
}

export interface CreateRentalDTO {
  customerId: number;
  videoId: number;
}

// --- Update DTOs ---
export interface UpdateVideoDTO {
  title?: string;
  director?: string;
  status?: 'szabad' | 'kikölcsönzött' | 'selejtezett';
  acquisitionDate?: string | null;
  serialNumber?: string | null;
}

export interface UpdateCustomerDTO {
  name?: string;
  phone?: string;
  idCardNumber?: string;
  address?: string;
  status?: 'active' | 'deleted' | 'inactive';
}

// Kölcsönzés frissítésére általában csak a visszahozatal (`return`) művelet van,
// a többi adat (customerId, videoId, rentalDate) általában nem módosítható egy meglévő kölcsönzésen.
// Ha mégis lenne más frissíthető mező, itt lehetne definiálni.
// export interface UpdateRentalDTO {
//   status?: 'rented' | 'returned';
//   returnDate?: string | null;
// }

// Válasz DTO-k, ha a backend specifikus üzeneteket küld
export interface ApiResponseWithMessage<T> {
    message: string;
    video?: T; // A 'video' kulcs a VideoService deleteVideo válaszából jön
    customer?: T; // Hasonlóan a CustomerService-hez
    rental?: T; // Hasonlóan a RentalService-hez
}
