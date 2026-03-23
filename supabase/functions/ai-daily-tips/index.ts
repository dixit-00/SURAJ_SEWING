import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const groqApiKey = Deno.env.get('GROQ_API_KEY') || Deno.env.get('VITE_GROQ_API_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Verify Authorization if this is called manually (optional, but good practice)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    if (!groqApiKey) throw new Error("Missing Groq API Key for AI generation.");

    // 1. Fetch a batch of users (e.g., up to 50 active users to avoid timeouts)
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .limit(50);

    if (userError || !users?.length) {
      return new Response("No users found.", { status: 200 });
    }

    // 2. Ask Groq AI to generate a creative tip or notification about Sewing/Machines
    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Using a fast Groq model
        messages: [{
          role: "system",
          content: "You are an expert tailor and sewing machine specialist working for 'Suraj Sewing Machine'. Generate a strictly short, 1-sentence engaging tip for our users. Do not include quotes. Make it actionable, like 'Keep your machine oiled every 3 months for peak performance!' or 'Looking to sew thick denim? Check out our heavy-duty industrial models!'. Randomize the topic."
        }],
        temperature: 0.9,
      }),
    });

    const aiData = await aiResponse.json();
    const tip = aiData?.choices?.[0]?.message?.content?.trim() || "Remember to clean your sewing machine's bobbin area weekly to prevent threading issues!";

    // 3. Prepare the insert payload for all users
    const notificationsToInsert = users.map(user => ({
      user_id: user.id,
      type: 'system',
      title: '🧵 Daily Sewing Tip by AI',
      message: `Hi ${user.name.split(' ')[0]}, ${tip}`,
    }));

    // 4. Insert into the database
    const { error: insertError } = await supabase.from('notifications').insert(notificationsToInsert);

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, count: users.length, tip }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("AI Cron Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
