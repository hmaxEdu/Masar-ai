//agent-chat

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { messages, tools } = await req.json()
    const apiKey = Deno.env.get('OLLAMA_API_KEY')
    
    if (!apiKey) throw new Error("Missing OLLAMA_API_KEY")

    const response = await fetch('https://ollama.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gemma4:31b-cloud ', // Make sure your configured model supports tools
        messages: messages,
        tools: tools, // Pass the tools to Ollama
        stream: false
      })
    })

    if (!response.ok) throw new Error(`Ollama Error: ${await response.text()}`)
    const data = await response.json()

    return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

// generate-subtasks

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // 1. Handle CORS Preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { taskTitle, taskDescription } = await req.json()
    
    // Get the API Key from Supabase Secrets
    const apiKey = Deno.env.get('OLLAMA_API_KEY') 
    if (!apiKey) {
      throw new Error("Missing OLLAMA_API_KEY in Supabase Secrets")
    }

    const prompt = `You are an expert project manager. Break down the following task into 3 to 5 highly actionable sub-tasks. 
Return ONLY a JSON object with a 'subtasks' array.
Task: "${taskTitle}"
Description: "${taskDescription || ''}"`;

    // 2. Call Ollama
    const response = await fetch('https://ollama.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gemma4:31b-cloud',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        format: {
          type: "object",
          properties: {
            subtasks: { type: "array", items: { type: "string" } }
          },
          required: ["subtasks"]
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Ollama API Error: ${errorData}`)
    }

    const data = await response.json()

    // 3. Return the result with CORS headers
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      },
    })
  }
})

// analyze-project

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tasksData } = await req.json()
    const apiKey = Deno.env.get('OLLAMA_API_KEY')

    if (!apiKey) throw new Error("Missing OLLAMA_API_KEY")

    const prompt = `You are an expert Agile Project Manager. Review the following list of tasks for my project.
Provide a brief, encouraging "Executive Summary" (max 2 sentences) of the project's health.
Then, identify the 2 most critical tasks I should focus on next and explain why in short bullet points.

Here is the current task data (JSON):
${tasksData}`;

    const response = await fetch('https://ollama.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gemma4:31b-cloud',
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    })

    if (!response.ok) throw new Error(`Ollama Error: ${await response.text()}`)

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})