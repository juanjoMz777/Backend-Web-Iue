import { connectDb } from "./sql-adapter.js";

export class BancoWeb {
  constructor() {
    this.connect = connectDb;
  }

  async registroUsuarios(usuario, email, clave, numero_cuenta, tipo_cuenta) {
    try {
        const db = await this.connect();
        
        const [existingUser] = await db.execute(
            "SELECT * FROM usuarios WHERE email = ? OR numero_cuenta = ?",
            [email, numero_cuenta]
        );

        if (existingUser.length > 0) {
            throw new Error("El usuario o el número de cuenta ya existen.");
        }

        const [rows] = await db.execute(
            "INSERT INTO usuarios (usuario, email, clave, numero_cuenta, tipo_cuenta) VALUES (?, ?, ?, ?, ?)",
            [usuario, email, clave, numero_cuenta, tipo_cuenta]
        );

        await db.end();
        return rows.insertId ?? null;
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        throw error;
    }
}


  async login(usuario) {
    try {
      const db = await this.connect();
      const [clave] = await db.execute(
        "SELECT clave FROM usuarios WHERE usuario = ?",
        [usuario]
      );
      await db.end();
      return clave[0].clave ?? null;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  }
}
