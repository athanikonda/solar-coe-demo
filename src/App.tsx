import { useState } from "react";

function App() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async (input: string) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: input }]
      })
    });

    const data = await res.json();
    return data.reply;
  };

  const handleSend = async () => {
    if (!input) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    const reply = await sendMessage(input);

    const botMessage = { role: "assistant", content: reply };
    setMessages((prev) => [...prev, botMessage]);

    setInput("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">
        Solar CoE Assistant
      </h1>

      <div className="w-full max-w-md bg-white shadow rounded p-4">
        <div className="h-64 overflow-y-auto mb-3 border p-2 rounded">
          {messages.map((m, i) => (
            <div key={i} className="mb-2 text-sm">
              <b>{m.role === "user" ? "You" : "CoE"}:</b> {m.content}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 border p-2 rounded"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about solar..."
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-3 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;