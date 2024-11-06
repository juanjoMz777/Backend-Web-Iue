import dotenv from 'dotenv';
dotenv.config();


export const HOST = process.env.HOST ?? 'localhost';
export const PORT = process.env.PORT ?? 3000;
export const USER = process.env.USER ?? '';
export const PASSWORD = process.env.PASSWORD ?? '';
export const DATABASE = process.env.DATABASE ?? '';
