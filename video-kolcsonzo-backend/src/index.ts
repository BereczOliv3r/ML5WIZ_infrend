// src/index.ts
    import "reflect-metadata";
    import express, { Request, Response, NextFunction, Application, ErrorRequestHandler } from 'express';
    import cors from 'cors';
    import { AppDataSource } from "./data-source"; // Figyelj a helyes relatív útvonalra!
    import mainRouter from './routes'; // Importáljuk a fő routert

    const app: Application = express();
    const port = process.env.PORT || 3000; // Port beállítása

    // Middleware-ek
    app.use(cors());
    app.use(express.json());

    // TypeORM adatbázis-kapcsolat inicializálása
    AppDataSource.initialize()
        .then(async () => { // async hozzáadva, ha szükség lenne await-re itt
            console.log("Data Source has been initialized successfully.");

            // Alap üdvözlő útvonal
            app.get('/', (req: Request, res: Response) => {
                res.send('Hello a Videó Kölcsönző Backendről! (Strukturált verzió)');
            });

            // API útvonalak csatlakoztatása a fő routeren keresztül, /api előtaggal
            app.use('/api', mainRouter);

            // Központi hibakezelő middleware (az összes útvonal után kell lennie)
            const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
                console.error("Központi hibakezelő elkapta:", err.stack);
                if (!res.headersSent) {
                    res.status(500).send('Valami hiba történt a szerveren!');
                }
            };
            app.use(errorHandler);

            // Szerver indítása
            app.listen(port, () => {
                console.log(`Backend szerver fut a http://localhost:${port} címen`);
            });

        })
        .catch((error) => console.log("Error during Data Source initialization:", error));
    