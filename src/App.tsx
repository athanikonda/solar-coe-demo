import { useState } from "react";

function App() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (input: string) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }]
        })
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("API Error:", text);
        throw new Error("API request failed");
      }

      const data = await res.json();
      return data.reply || "No response from assistant";

    } catch (error) {
      console.error("Chat error:", error);
      return "⚠️ Connection error. Please try again.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const reply = await sendMessage(input);

    const botMessage = { role: "assistant", content: reply };

    setMessages((prev) => [...prev, botMessage]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">
        Solar CoE Assistant
      </h1>

      <div className="w-full max-w-md bg-white shadow rounded p-4">
        
        {/* Chat Window */}
        <div className="h-64 overflow-y-auto mb-3 border p-2 rounded bg-gray-50">
          {messages.length === 0 && (
            <p className="text-gray-400 text-sm">
              Ask anything about solar energy, policy, or finance...
            </p>
          )}

          {messages.map((m, i) => (
            <div key={i} className="mb-2 text-sm">
              <b>{m.role === "user" ? "You" : "CoE"}:</b> {m.content}
            </div>
          ))}

          {loading && (
            <div className="text-sm text-gray-500">CoE is typing...</div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            className="flex-1 border p-2 rounded"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about solar..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />

          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
            disabled={loading}
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;
