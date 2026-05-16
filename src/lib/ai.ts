// src/lib/ai.ts
import { supabase } from './supabase';

export async function generateSubtasks(taskTitle: string, taskDescription: string): Promise<string[]> {
  const { data, error } = await supabase.functions.invoke('generate-subtasks', {
    body: { taskTitle, taskDescription }
  });

  if (error) {
    let exactError = error.message;
    if (error.context && typeof error.context.json === 'function') {
       const errBody = await error.context.json().catch(() => ({}));
       if (errBody.error) exactError = errBody.error;
    }
    console.error("Supabase Function Error:", exactError);
    throw new Error(exactError);
  }

  try {
    let aiContent = data.message?.content || "";
    
    console.log("Raw AI Output:", aiContent); // Helpful for debugging

    // 1. Strip out markdown code block wrappers if present
    aiContent = aiContent.replace(/```json/gi, '').replace(/```/g, '').trim();

    // 2. Extract ONLY the JSON object (find first { and last })
    const firstBrace = aiContent.indexOf('{');
    const lastBrace = aiContent.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      aiContent = aiContent.substring(firstBrace, lastBrace + 1);
    }

    // 3. Parse the clean JSON
    const parsed = JSON.parse(aiContent);
    
    if (!parsed.subtasks || !Array.isArray(parsed.subtasks)) {
      throw new Error("Missing 'subtasks' array in AI response");
    }

    return parsed.subtasks;

  } catch (e) {
    console.error("Failed to parse AI response. Raw data:", data);
    // Show a snippet of what the AI actually said to help debug
    const snippet = data?.message?.content?.substring(0, 100) || "Empty response";
    throw new Error(`AI returned an invalid format.\n\nAI said: "${snippet}..."`);
  }
}