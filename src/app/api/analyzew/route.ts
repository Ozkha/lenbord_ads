import { NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";
import { db } from "@/db";
import {
  fiveWhys,
  intelligent_suggestions,
  wheres,
  whos,
  whys,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const client = new InferenceClient(process.env.HF_TOKEN);

export async function GET() {
  try {
    const dbb = await db;

    const ia_suggestion = await dbb
      .select()
      .from(intelligent_suggestions)
      .where(
        sql`${intelligent_suggestions.date_generated} >= NOW() - INTERVAL 7 DAY`
      );

    if (ia_suggestion.length > 0) {
      return NextResponse.json({
        cleanedAnalysis: ia_suggestion[0].suggestion,
      });
    }

    // 3. SI NO HAY SUGERENCIA, CREARLA. SI LA HAY, DARLA.

    const reports = await dbb
      .select({
        what: fiveWhys.what,
        why: whys.label,
        whyDetails: fiveWhys.whyDetails,
        where: wheres.label,
        who: whos.label,
        when: fiveWhys.date,
      })
      .from(fiveWhys)
      .leftJoin(whys, eq(whys.id, fiveWhys.whyId))
      .leftJoin(wheres, eq(wheres.id, fiveWhys.whereId))
      .leftJoin(whos, eq(whos.id, fiveWhys.whoId))
      .orderBy(sql`rand()`)
      .limit(6);

    if (!reports || reports.length === 0) {
      return NextResponse.json(
        { error: "No hay reportes suficientes para procesar la instruccion" },
        { status: 400 }
      );
    }

    const formattedReports = reports
      .map(
        (r, index) =>
          `Incidente ${index + 1}:
      - Qué: ${r.what}
      - Detalles del que: ${r.whyDetails}
      - Por qué: ${r.why}
      - Dónde: ${r.where}
      - Quién: ${r.who}
      - Cuándo: ${r.when.toLocaleDateString("MX")}`
      )
      .join("\n\n---\n\n");

    const systemPrompt = `Eres un experto analista de datos y consultor estratégico. Tu tarea es analizar un conjunto de reportes de incidentes para identificar patrones, causas raíz comunes y temas recurrentes.`;

    const userPrompt = `
      A continuación se presenta un lote de ${reports.length} incidentes.
      
      **Datos de Incidentes:**
      ${formattedReports}

      **Tu Análisis:**
      Basado en el análisis holístico de TODOS los incidentes, responde a lo siguiente:
      1.  **Patrones y Temas Comunes:** ¿Cuáles son los 1-2 problemas más recurrentes que observas?
      2.  **Causas Raíz Sistémicas:** ¿Qué problemas de fondo (ej. falta de capacitación, fallas de equipo, problemas de proceso) parecen estar causando estos incidentes?
      3.  **Recomendaciones Estratégicas:** Proporciona 3 recomendaciones de alto nivel, dirigidas a la gerencia, para abordar estas causas raíz y mejorar los procesos de forma duradera.
      
      **Puntos que debes tener en cuenta:**
      1. Debes sugerirme un plan de accion.
      2. No debes formatear el infrome a escpecion de listas y saltos de linea.
      3. Tu respuesta debe ser en español.
      `;

    const chatCompletion = await client.chatCompletion({
      provider: "novita",
      //   model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
      model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1024,
    });

    const fullAnalysis = chatCompletion.choices[0].message.content!;

    const regex = new RegExp("^<think>.*?</think>\\s*", "s");
    const cleanedAnalysis = fullAnalysis.replace(regex, "");

    const storedSuggestionResp = await dbb
      .insert(intelligent_suggestions)
      .values({ suggestion: cleanedAnalysis });

    return NextResponse.json({ cleanedAnalysis });
  } catch (error) {
    console.error("Error en el análisis por lotes:", error);
    return NextResponse.json(
      { error: "Error al generar el análisis" },
      { status: 500 }
    );
  }
}
