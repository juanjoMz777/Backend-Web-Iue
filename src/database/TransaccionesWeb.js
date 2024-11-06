import { connectDb } from "./sql-adapter.js";

export class TransaccionesWeb {
  constructor() {
    this.connect = connectDb;
  }

  async transaccion(cuenta_origen, cuenta_id, monto, fecha) {
    try {
      if (!cuenta_origen) {
        throw new Error(
          "No se puede realizar la transacción sin cuenta origen"
        );
      }

      const db = await this.connect();

      await verificarSaldoDisponible(db, cuenta_origen, monto);

      await db.beginTransaction();

      const [result] = await db.execute(
        `UPDATE usuarios 
             SET saldo = CASE 
                 WHEN numero_cuenta = ? THEN saldo - ?
                 WHEN numero_cuenta = ? THEN saldo + ?
                 ELSE saldo 
             END 
             WHERE numero_cuenta IN (?, ?)`,
        [cuenta_origen, monto, cuenta_id, monto, cuenta_origen, cuenta_id]
      );

      if (result.affectedRows !== 2) {
        throw new Error("Error al actualizar las cuentas");
      }
      await db.execute(
        "INSERT INTO tabla_bitacora (id_cliente, tipo, monto, fecha_transacción) VALUES(?,?,?,?)",
        [cuenta_origen, "transaccion", monto, fecha]
      );

      await db.commit();
      await db.end();
      return true;
    } catch (error) {
      if (db) await db.rollback();
      console.error(
        `Error al realizar la transacción al usuario: ${cuenta_id}`,
        error
      );
      throw error;
    }
  }

  async ingreso(cuenta_id, monto, fecha) {
    try {
      const db = await this.connect();
      const [rows] = await db.execute(
        "UPDATE usuarios SET saldo = saldo + ? WHERE numero_cuenta = ?",
        [monto, cuenta_id]
      );
      await db.execute(
        "INSERT INTO tabla_bitacora (id_cliente, tipo, monto, fecha_transacción) VALUES(?,?,?,?)",
        [cuenta_id, "deposito", monto, fecha]
      );
      await db.commit();
      await db.end();
      return rows.affectedRows > 0 ?? null;
    } catch(error) {
      console.error(
        `Error al  realizar el ingreso al usuario: ${cuenta_id}`,
        error
      );
      throw error;
    }
  }

  async retiro(cuenta_id, monto, fecha) {
    try {
      const db = await this.connect();
      await verificarSaldoDisponible(db, cuenta_id, monto);

      const [rows] = await db.execute(
        "UPDATE usuarios SET saldo = saldo - ? WHERE numero_cuenta = ?",
        [monto, cuenta_id]
      );

      await db.execute(
        "INSERT INTO tabla_bitacora (id_cliente, tipo, monto, fecha_transacción) VALUES(?,?,?,?)",
        [cuenta_id, "retiro", monto, fecha]
      );
      await db.commit();
      await db.end();
      return rows.affectedRows > 0;
    } catch (error) {
      console.error(
        `Error al realizar el retiro al usuario: ${cuenta_id}`,
        error
      );
      throw error;
    }
  }

  async prestamo(cuenta_id, monto_prestamo, abonar = false) {
    try {
      const db = await this.connect();
      const [result] = await db.execute(
        "SELECT prestamos, valor_prestamo FROM usuarios WHERE numero_cuenta = ?",
        [cuenta_id]
      );

      const { prestamos, valor_prestamo } = result[0] || {};

      if (result.length === 0) {
        throw new Error("Usuario no encontrado.");
      }

      if (abonar) {
        if (prestamos === 0) {
          throw new Error("No hay deuda pendiente para abonar.");
        }

        if (monto_prestamo <= 0 || monto_prestamo > valor_prestamo) {
          throw new Error(
            "El monto de abono debe ser positivo y no puede exceder la deuda actual."
          );
        }

        const nuevoSaldoPrestamo = valor_prestamo - monto_prestamo;
        const prestamosActualizado = nuevoSaldoPrestamo === 0 ? 0 : prestamos;

        const [updateResult] = await db.execute(
          `UPDATE usuarios 
                 SET valor_prestamo = ?, prestamos = ? 
                 WHERE numero_cuenta = ?`,
          [nuevoSaldoPrestamo, prestamosActualizado, cuenta_id]
        );

        await db.end();

        if (updateResult.affectedRows > 0) {
          return nuevoSaldoPrestamo === 0
            ? "Paz y salvo. La deuda ha sido cancelada completamente."
            : "Abono realizado correctamente.";
        } else {
          throw new Error("Error al registrar el abono.");
        }
      } else {
        if (prestamos >= 2) {
          throw new Error(
            "No se puede realizar el préstamo. Límite de préstamos alcanzado."
          );
        }

        if (monto_prestamo <= 0) {
          throw new Error("El monto del préstamo debe ser positivo.");
        }

        const [updateResult] = await db.execute(
          `UPDATE usuarios 
                 SET prestamos = prestamos + 1, valor_prestamo = valor_prestamo + ? 
                 WHERE numero_cuenta = ?`,
          [monto_prestamo, cuenta_id]
        );

        await db.end();

        if (updateResult.affectedRows > 0) {
          return "Préstamo concedido exitosamente.";
        } else {
          throw new Error("Error al registrar el préstamo.");
        }
      }
    } catch (error) {
      console.error(
        `Error en la operación de préstamo o abono para el usuario: ${cuenta_id}`,
        error
      );
      throw error;
    }
  }
}

async function verificarSaldoDisponible(db, cuenta_id, monto) {
  const [resultado] = await db.execute(
    "SELECT saldo FROM usuarios WHERE numero_cuenta = ?",
    [cuenta_id]
  );
  if (resultado[0].saldo < monto) {
    throw new Error("Saldo insuficiente para realizar la operación");
  }
  return true;
}
