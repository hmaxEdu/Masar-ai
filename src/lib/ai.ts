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

export async function getProjectInsights(tasks: any[]): Promise<string> {
  // Strip down the task data so we don't send massive payloads to the AI
  const simplifiedTasks = tasks.map(t => ({
    title: t.title,
    status: t.status,
    priority: t.priority
  }));

  const { data, error } = await supabase.functions.invoke('analyze-project', {
    body: { tasksData: JSON.stringify(simplifiedTasks) }
  });

  if (error) {
    let exactError = error.message;
    if (error.context && typeof error.context.json === 'function') {
       const errBody = await error.context.json().catch(() => ({}));
       if (errBody.error) exactError = errBody.error;
    }
    throw new Error(exactError);
  }

  return data.message.content;
}

export async function sendProjectChatMessage(messages: any[], projectContext: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('project-chat', {
    body: { messages, projectContext }
  });

  if (error) {
    let exactError = error.message;
    if (error.context && typeof error.context.json === 'function') {
       const errBody = await error.context.json().catch(() => ({}));
       if (errBody.error) exactError = errBody.error;
    }
    throw new Error(exactError);
  }

  return data.message.content;
}

export interface GeneratedTask {
  title: string;
  description: string;
  priority: number;
}

export async function generateProjectPlan(goal: string, projectContext: string): Promise<GeneratedTask[]> {
  const { data, error } = await supabase.functions.invoke('ai-planner', {
    body: { goal, projectContext }
  });

  if (error) {
    let exactError = error.message;
    if (error.context && typeof error.context.json === 'function') {
       const errBody = await error.context.json().catch(() => ({}));
       if (errBody.error) exactError = errBody.error;
    }
    throw new Error(exactError);
  }

  try {
    let aiContent = data.message?.content || "";
    aiContent = aiContent.replace(/```json/gi, '').replace(/```/g, '').trim();
    const firstBrace = aiContent.indexOf('{');
    const lastBrace = aiContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      aiContent = aiContent.substring(firstBrace, lastBrace + 1);
    }
    const parsed = JSON.parse(aiContent);
    return parsed.tasks || [];
  } catch (e) {
    throw new Error("AI returned an invalid plan format");
  }
}

export async function sendAgentTurn(messages: any[]) {
  const { data, error } = await supabase.functions.invoke('agent-chat', {
    body: { messages } 
  });

  if (error) {
    let exactError = error.message;
    if (error.context && typeof error.context.json === 'function') {
       const errBody = await error.context.json().catch(() => ({}));
       if (errBody.error) exactError = errBody.error;
    }
    throw new Error(exactError);
  }

  return data.message; 
}
/**
 * Handles consuming a chunked NDJSON stream from the Edge Function
 */
export async function* streamAgentTurn(messages: any[]) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/agent-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`
    },
    // No tools sent here anymore
    body: JSON.stringify({ messages, stream: true })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error: ${err}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    
    // Keep the last partial line in the buffer
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim()) {
        try {
          yield JSON.parse(line);
        } catch (e) {
          console.error("Failed to parse chunk:", line);
        }
      }
    }
  }

  // Handle any remaining string in the buffer
  if (buffer.trim()) {
    try {
      yield JSON.parse(buffer);
    } catch (e) {
      console.error("Failed to parse final chunk:", buffer);
    }
  }
}