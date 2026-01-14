
import { GoogleGenAI, Type } from "@google/genai";
import { StructureBlueprint, StructureSize, OptimizedPromptData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ARCHITECT_SYSTEM_PROMPT = `You are an elite Minecraft master builder AI specialized exclusively in creating ultra-realistic, high-end modern luxury villas in vanilla Minecraft Java Edition 1.20+ style — exactly like top architects on YouTube, TikTok, and Reddit.

Your absolute priority is aesthetic excellence, realism, and detail.

Core mandatory style rules:
1. Multi-level (2–4 stories) with cantilevered upper floors supported by pillars/beams.
2. Large panoramic floor-to-ceiling glass windows (glass_pane).
3. Clean material palette: quartz_block, white_concrete, deepslate, polished_andesite.
4. Warm wood accents: oak, dark_oak, cherry, or mangrove planks/logs.
5. Infinity pools with glass edge effects and wooden decks.
6. Open-concept interiors with detailed modern furniture (sofas, tables, lighting).
7. Extensive exterior landscaping (azalea bushes, grass paths, flowers).
8. Visible support columns; no floating blocks.

Output: Return PURE JSON only.`;

function parseAiJson(text: string | undefined) {
  if (!text) throw new Error("AI returned empty response");
  const cleaned = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerE) {
        throw new Error("Invalid AI JSON response");
      }
    }
    throw new Error("Invalid AI JSON response");
  }
}

const optimizeSchema = {
  type: Type.OBJECT,
  properties: {
    refined_user_description: { type: Type.STRING },
    reasoning_steps: { type: Type.ARRAY, items: { type: Type.STRING } },
    structure_metadata: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        style: { type: Type.STRING },
        overall_footprint: {
          type: Type.OBJECT,
          properties: {
            width: { type: Type.NUMBER },
            height: { type: Type.NUMBER },
            depth: { type: Type.NUMBER }
          },
          required: ["width", "height", "depth"]
        },
        levels: { type: Type.NUMBER },
        cantilever_depth: { type: Type.NUMBER },
        primary_material: { type: Type.STRING },
        has_pool: { type: Type.BOOLEAN },
        estimated_block_count: { type: Type.NUMBER },
        unique_blocks_list: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["name", "style", "overall_footprint", "levels", "cantilever_depth", "primary_material", "has_pool", "unique_blocks_list"]
    },
    high_level_plan: {
      type: Type.OBJECT,
      properties: {
        foundation: { type: Type.STRING },
        main_walls: { type: Type.STRING },
        roof: { type: Type.STRING },
        interior: { type: Type.STRING },
        exterior_details: { type: Type.STRING },
        pool: { type: Type.STRING }
      },
      required: ["foundation", "main_walls", "roof", "interior", "exterior_details", "pool"]
    },
    critical_requirements: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["refined_user_description", "reasoning_steps", "structure_metadata", "high_level_plan", "critical_requirements"]
};

const blueprintSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    style: { type: Type.STRING },
    description: { type: Type.STRING },
    dimensions: {
      type: Type.OBJECT,
      properties: { 
        width: { type: Type.NUMBER }, 
        height: { type: Type.NUMBER }, 
        depth: { type: Type.NUMBER } 
      },
      required: ["width", "height", "depth"]
    },
    metadata: {
      type: Type.OBJECT,
      properties: {
        levels: { type: Type.NUMBER },
        cantilever_depth: { type: Type.NUMBER },
        has_infinity_pool: { type: Type.BOOLEAN },
        unique_blocks_list: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    materials: {
      type: Type.OBJECT,
      properties: {
        walls: { type: Type.STRING },
        wall_variation: { type: Type.STRING },
        floor: { type: Type.STRING },
        roof: { type: Type.STRING },
        accents: { type: Type.STRING },
        details: { type: Type.STRING },
        lighting: { type: Type.STRING },
        has_pool: { type: Type.BOOLEAN },
        accent_wood: { type: Type.STRING },
        glass_type: { type: Type.STRING }
      },
      required: ["walls", "floor", "roof", "lighting"]
    },
    features: { type: Type.ARRAY, items: { type: Type.STRING } },
    tutorial: {
      type: Type.OBJECT,
      properties: {
        difficulty: { type: Type.STRING },
        totalEstimatedTime: { type: Type.STRING },
        recommendedTools: { type: Type.ARRAY, items: { type: Type.STRING } },
        phases: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              estimatedTime: { type: Type.STRING },
              checkpoint: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    coordinates: { type: Type.STRING },
                    blocksNeeded: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                }
              }
            },
            required: ["name", "estimatedTime", "steps"]
          } 
        }
      },
      required: ["difficulty", "totalEstimatedTime", "phases", "recommendedTools"]
    }
  },
  required: ["name", "style", "dimensions", "materials", "tutorial"]
};

export async function optimizePrompt(userPrompt: string, options: any): Promise<OptimizedPromptData> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze this Minecraft build request and produce an ultra-detailed technical specification for a luxury villa.
User Request: "${userPrompt}"
Context: Size=${options.size}, Edition=${options.edition}

Aim for 2026-level architecture: cantilevers, infinity pools, integrated lighting.`,
    config: { 
      responseMimeType: "application/json", 
      responseSchema: optimizeSchema,
      temperature: 0.8
    }
  });
  
  return parseAiJson(response.text);
}

export async function generateBlueprint(prompt: string, size: StructureSize): Promise<StructureBlueprint> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a premium Minecraft architectural blueprint for: ${prompt}. Size: ${size}. Use multi-level planning and cantilevered geometry.`,
    config: { 
      systemInstruction: ARCHITECT_SYSTEM_PROMPT, 
      responseMimeType: "application/json", 
      responseSchema: blueprintSchema,
      temperature: 0.85
    }
  });
  return parseAiJson(response.text);
}

export async function adjustBlueprint(original: StructureBlueprint, adjustment: string): Promise<StructureBlueprint> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Original Blueprint: ${JSON.stringify(original)}. \nAdjustment Request: ${adjustment}. \nMaintain the high-end luxury villa style.`,
    config: { 
      systemInstruction: ARCHITECT_SYSTEM_PROMPT, 
      responseMimeType: "application/json", 
      responseSchema: blueprintSchema,
      temperature: 0.7
    }
  });
  return parseAiJson(response.text);
}
