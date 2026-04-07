export default async function handler(req, res) {
  // ✅ Handle GET (for testing in browser)
  if (req.method === "GET") {
    return res.status(200).json({ message: "API is working" });
  }

  // ✅ Only allow POST for chat
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: "Messages missing" });
    }

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
            content: `You are a Solar Centre of Excellence assistant. Provide India-focused insights on solar energy, policy, grid, storage, and finance.`
          },
          ...messages
        ]
      })
    });

    const data = await response.json();

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
