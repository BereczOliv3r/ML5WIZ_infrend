// src/entity/Video.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Rental } from "./Rental"; // Feltételezve, hogy a Rental.ts ugyanabban az 'entity' mappában van

@Entity()
export class Video {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    director!: string;

    @Column({ default: 'szabad' })
    status!: string;

    @Column({ type: 'date', nullable: true })
    acquisitionDate!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true }) // KIEGÉSZÍTVE: Explicit típus és hossz
    serialNumber!: string | null;

    @OneToMany(() => Rental, rental => rental.video)
    rentals!: Rental[];
}
