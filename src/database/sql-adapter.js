import mysql from 'mysql2/promise';
import { HOST, USER, PASSWORD, DATABASE } from '../utils/Envs.js';

export const connectDb = async () => {
    try {
        const db = await mysql.createConnection({
            host: HOST,
            user: USER,
            password: PASSWORD,
            database: DATABASE,
        });
        console.log('Conexión exitosa a la base de datos MySQL');
        return db; 
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
        throw err; 
    }
};
