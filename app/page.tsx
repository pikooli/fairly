'use client'
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [errors, setErrors] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setMessages(prev => ([...prev, { role: "user", content: inputText }]));
      setInputText("");
      const res = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: inputText }),
      });
      
      const data = await res.json();
      setMessages(prev => ([...prev, { role: "assistant", content: data.response }]));
      setErrors("");
    } catch (error) {
      console.error("Error:", error);
      setErrors("An error occurred while processing your request.");
    }
  };

  console.log(messages);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-foreground">
      <main className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">Welcome to Our AI Assistant</h1>
          <div className="mt-8 p-4 bg-gray-100 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Chat History</h2>
            <div className="space-y-4 h-[300px] overflow-y-auto">
              {messages?.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}

            </div>
          </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your question here"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
          {errors && <p className="text-red-500">{errors}</p>}
        </form>
      </main>
    </div>
  );
}
