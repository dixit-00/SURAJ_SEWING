import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      throw new Error('Missing GEMINI_API_KEY secret')
    }

    // Prepare prompt with system instructions specifically for Suraj Sewing Machine
    const systemInstruction = `You are a helpful, knowledgeable customer support assistant for "Suraj Sewing Machine". 
You help customers understand industrial and domestic sewing machines, spare parts, and orders.
Be concise, polite, and helpful. If asked about prices not in context, advise them to check the catalog or contact support.`;

    const requestBody = {
      contents: [{
        parts: [{ text: `${systemInstruction}\n\nUser: ${message}` }]
      }]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    // Extract the text from Gemini response structure
    let reply = "I'm sorry, I couldn't process your request.";
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      reply = data.candidates[0].content.parts[0].text;
    }

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
