// src/entity/Customer.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Rental } from "./Rental"; // Feltételezve, hogy a Rental.ts ugyanabban az 'entity' mappában van

@Entity()
export class Customer {
    @PrimaryGeneratedColumn()
    id!: number; // '!' jelzi, hogy ez az érték biztosan inicializálva lesz (TypeORM által)

    @Column()
    name!: string;

    @Column()
    phone!: string;

    @Column()
    idCardNumber!: string;

    @Column()
    address!: string;

    @Column({ default: 'active' })
    status!: string;

    // A 'rental => rental.customer' határozza meg a Rental entitásban lévő 'customer' mezőt.
    // Az { eager: false } (vagy ha nincs megadva) azt jelenti, hogy a kölcsönzések nem töltődnek be automatikusan,
    // csak ha expliciten kérjük (pl. relations opcióval a find metódusokban).
    // Ha mindig kellenek, akkor { eager: true } lehet.
    @OneToMany(() => Rental, rental => rental.customer)
    rentals!: Rental[]; // '!' vagy inicializálhatod üres tömbbel: rentals: Rental[] = [];
}

