// src/entity/Rental.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Customer } from "./Customer"; // Feltételezve, hogy a Customer.ts ugyanabban az 'entity' mappában van
import { Video } from "./Video";     // Feltételezve, hogy a Video.ts ugyanabban az 'entity' mappában van

@Entity()
export class Rental {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Customer, customer => customer.rentals, { eager: true })
    customer!: Customer;

    @Column()
    customerId!: number;

    @ManyToOne(() => Video, video => video.rentals, { eager: true })
    video!: Video;

    @Column()
    videoId!: number;

    @CreateDateColumn() // Ez automatikusan inicializálja
    rentalDate!: Date;

    @Column({ type: 'datetime', nullable: true })
    returnDate!: Date | null;

    @Column({ default: 'rented' })
    status!: string;
}
