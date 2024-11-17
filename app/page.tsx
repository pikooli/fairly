'use client'
import { useState, useEffect, useRef } from "react";

// const dummyMessages = [
//   { role: "assistant", content: "Hello! How can I assist you today?" },
//     { role: "user", content: "What is the weather in Tokyo?" },
//     { role: "user", content: "What is the weather in Tokyo?" },
//     { role: "user", content: "What is the weather in Tokyo?" },
//     { role: "user", content: "What is the weather in Tokyo?" },
//     { role: "assistant", content: "Hello! How can I assist you today?" },
//     { role: "assistant", content: "Hello! How can I assist you today?" },
// ]

export default function Home() {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [errors, setErrors] = useState("");
  const [contextText, setContextText] = useState("");
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    try {
      setLoading(true);
      const newMessages = [...messages, { role: "user", content: inputText }];
      setMessages(newMessages);
      setInputText("");
      console.log(inputText);
      const res = await fetch("/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputText }),
      });
      
      const data = await res.json();
      setMessages(prev => ([...prev, { role: "assistant", content: data.response.text }]));
      setContextText(data.response.contextText);
      setErrors("");
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setErrors("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  console.log(messages);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-background text-foreground">
      {loading && <div className="fixed inset-0 flex items-center justify-center bg-green-500 bg-opacity-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>} 
      <main className="w-full max-w-full">
        <h1 className="text-3xl font-bold mb-8 text-center">Our AI Legal Assistant</h1>
          <h2 className="text-xl font-semibold mb-4">Chat History</h2>
          <div className={`mt-8 p-4 bg-gray-100 rounded-md  grid gap-4 ${contextText ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div ref={chatHistoryRef} className="space-y-4 border border-gray-300 overflow-y-auto min-h-[450px] max-h-[600px]">
              {messages?.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}>
                    <p className='whitespace-pre-wrap'>{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
            {contextText && (
              <div className="bg-gray-100 p-4 rounded-md border border-gray-300 overflow-y-auto min-h-[450px] max-h-[600px]">
                <h2 className="text-xl font-semibold mb-4">Context</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{contextText}</p>
              </div>
            )}
          </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter your question here (Press Enter to send)"
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
      <div className="mt-8 p-6 bg-gray-100 rounded-md">
        <h2 className="text-xl font-semibold mb-4">About This Tool</h2>
        <p className="text-gray-600">
          Our AI Legal Assistant helps lawyers build stronger cases by analyzing past legal decisions and jurisprudence. 
          Simply describe your case, and our AI will identify relevant precedents and suggest effective legal strategies 
          based on similar successful cases. This tool streamlines legal research and helps develop more compelling arguments 
          backed by historical court decisions.
        </p>
      </div>
      <div className="mt-8 p-6 bg-gray-100 rounded-md">
        <h2 className="text-xl font-semibold mb-4">Subscribe to Our Newsletter</h2>
        <p className="text-gray-600 mb-4">Stay updated with the latest legal insights and AI developments.</p>
        <form className="flex gap-2" onSubmit={() => alert('this don\'t work yet')}>
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
      </main>
    </div>
  );
}
