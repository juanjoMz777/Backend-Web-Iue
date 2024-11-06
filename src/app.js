import express from "express";
import { PORT } from "./utils/Envs.js";
import { connectDb } from "./database/sql-adapter.js";
import cors from "cors";
import router from "./routes/index.js";

const app = express();

app.use(cors({
    origin: 'http://127.0.0.1:5173'
}));

app.use(express.json());

const init = async () => {
    try {
        const db = await connectDb();
    } catch (err) {
        console.error('Error en la inicialización de la aplicación:', err);
        process.exit(1); 
    }
};

app.use(router);

init().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
});

export default app;
