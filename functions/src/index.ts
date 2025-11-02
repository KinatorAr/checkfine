import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_KEY = defineSecret("GEMINI_KEY");

// Definimos la función que la app puede llamar
export const generarCotizacion = onCall({ secrets: [GEMINI_KEY] }, async (request, context) => {

// 👇 Obtén el valor real del secreto desde el contexto
    const apiKey = GEMINI_KEY.value();
    if (!apiKey) {
    logger.error("Error: La variable de entorno GEMINI_KEY no está definida o no se cargó correctamente.");
    throw new functions.https.HttpsError("internal", "Falta configuración de API Key");
    }
    // 1. Configuramos el cliente de Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Recibimos los datos de la app
    const data = request.data;
    const vehicle = data.vehicle;
    const damages = data.damages;
    const kilometraje = data.kilometraje;
    const tipoInspeccion = data.tipoInspeccion;

    logger.info("Recibida solicitud de cotización:", data);

    // Construimos el prompt (igual que antes)
    const damageDescriptions = damages
        .map((d: { tipo: string; ubicacion: string }) => `${d.tipo} en ${d.ubicacion}`)
        .join(", ");
    const vehicleInfo = `${vehicle.marca} ${vehicle.modelo} ${vehicle.anio}`;

    const promptBase = `
        Contexto: Eres un experto cotizador de reparaciones de autos en México.
        Modelo de Tabla:
        | Escenario | Descripción del Daño | Mano de Obra (Horas/Costo) | Materiales/Pintura | Piezas Requeridas | Subtotal | IVA (16%) | Costo Total Estimado |
        |---|---|---|---|---|---|---|---|
        | Daño Mínimo | Golpe superficial o arañazo, requiere desabollado ligero y repintado. | (ej. 2h / $1,000) | (ej. $800) | (ej. N/A) | (ej. $1,800) | (ej. $288) | (ej. $2,088) |
        | Daño Medio | Abolladura moderada, requiere desabollado a fondo, posible reparación de soportes y repintado. | (ej. 5h / $2,500) | (ej. $2,000) | (ej. N/A) | (ej. $4,500) | (ej. $720) | (ej. $5,220) |
        | Pérdida Total | Daño estructural severo, reparación supera el valor comercial de la pieza. | (ej. N/A) | (ej. N/A) | (ej. $15,000) | (ej. $15,000) | (ej. $2,400) | (ej. $17,400) |

        Tarea:
        Genera una Cotización Aproximada (en MXN) para lo siguiente:
        - Vehículo: ${vehicleInfo}
        - Daños: ${damageDescriptions}
        - Kilometraje: ${kilometraje} km
        - Tipo de Inspección: ${tipoInspeccion}

        Responde ÚNICAMENTE con la tabla Markdown final. No incluyas notas, explicaciones, ni cálculos; solo la tabla.
    `;

    logger.info("Enviando prompt a Gemini:", promptBase);

    try {
        const result = await model.generateContent(promptBase);
        const response = await result.response;
        const text = response.text();
        logger.info("Respuesta de Gemini recibida:", text);
        return { cotizacion: text };
    } catch (error) {
        logger.info("GEMINI_KEY obtenido:", !!apiKey);
        logger.error("Error al llamar a la API de Gemini:", error);
        throw new functions.https.HttpsError(
        "internal",
        "No se pudo generar la cotización.",
        error
        );
    }
});
