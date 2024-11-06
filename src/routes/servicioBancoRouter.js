import { ServiciosBanco } from "../controllers/ServiciosBanco.js";
import { registroSchema, transaccionSchema, prestamoSchema } from "./util/schema.js";

const servicioBanco = new ServiciosBanco();

export const registroRouter = async (req, res) => {
  try {
    const { usuario, email, clave, numero_cuenta, tipo_cuenta } =
      await registroSchema.validateAsync(req.body);
    const resultado = await servicioBanco.registroUsuarios(
      usuario,
      email,
      clave,
      numero_cuenta,
      tipo_cuenta
    );
    res
      .status(201)
      .json({ message: "Usuario registrado exitosamente", data: resultado });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Error al registrar usuario", error: e.message });
  }
};

export const loginRouter = async (req, res) => {
  try {
    const { usuario, clave } = req.body;
    const resultado = await servicioBanco.login(usuario, clave);
    resultado
      ? res
          .status(200)
          .json({ message: "Inicio de sesión exitoso", data: resultado })
      : res.status(401).json({ message: "Credenciales incorrectas" });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Error al iniciar sesión", error: e.message });
  }
};

export const transaccionRouter = async (req, res) => {
  try {
    const { cuenta_destino, tipo_transferencia, monto, cuenta_origen } = await transaccionSchema.validateAsync(req.body);
  const resultado = await servicioBanco.transaccion(
    cuenta_origen,
    cuenta_destino,
    tipo_transferencia,
    monto
  );
  return resultado ?
  res.status(200).json({message: `Transacción de tipo ${tipo_transferencia} realizada con exito`})
  : res.status(500).json({ message: "Error en la transacción" });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Error en la transacción", error: e.message });
  }
};

export const prestamoRouter = async (req, res) => {
  try{
    const { cuenta, monto, abonar } = await prestamoSchema.validateAsync(req.body);
    const resultado = await servicioBanco.prestamo(cuenta, monto, abonar);
    resultado ?
    res.status(200).json({message: resultado})
    : res.status(400).json({message:"Error en el prestamo"}) 
  }
  catch(e){
    console.log(e)
    res.status(500).json({message:"Error en el prestamo", error: e.message})
  }
}
