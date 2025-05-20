// src/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
// Javított import útvonalak az entitásokhoz:
import { Video } from "./entity/Video";
import { Customer } from "./entity/Customer";
import { Rental } from "./entity/Rental";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root", // Cseréld le a saját MySQL felhasználónevedre!
    password: "",    // Cseréld le a saját MySQL jelszavadra!
    database: "video_kolcsonzo_db", // Az adatbázis neve
    synchronize: true,
    logging: false, // Állítsd true-ra a hibakereséshez, hogy lásd az SQL parancsokat
    entities: [Video, Customer, Rental],
    migrations: [],
    subscribers: [],
    charset: "utf8mb4_unicode_ci",
});

