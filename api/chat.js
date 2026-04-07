export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ message: "API is working" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful Solar Centre of Excellence assistant for India."
          },
          ...messages
        ]
      })
    });

    const data = await response.json();

    // 🔍 DEBUG LOG (important)
    console.log("OpenAI response:", JSON.stringify(data));

    // ❗ HANDLE ERROR FROM OPENAI
    if (data.error) {
      return res.status(500).json({
        reply: "OpenAI Error: " + data.error.message
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        reply: "No response from model"
      });
    }

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({
      reply: "Server error: " + err.message
    });
  }
}
