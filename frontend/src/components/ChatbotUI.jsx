import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatbotUI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm Suraj sewing machine assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [productsContext, setProductsContext] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    const fetchCatalogForAI = async () => {
      try {
        const { data, error } = await supabase.from('products').select('name, price, stock, category, is_industrial, description, images');
        if (data && !error) {
          const formatted = data.map(p => {
            const imgUrl = p.images && p.images.length > 0 ? p.images[0].url : '';
            return `- ${p.name}: ₹${p.price} (Stock: ${p.stock}, Category: ${p.category}, Type: ${p.is_industrial ? "Industrial" : "Domestic"}). Image URL: ${imgUrl}. Desc: ${p.description.substring(0, 100)}...`;
          }).join('\n');
          setProductsContext(`\n\nHere is our live product catalog data you can use to answer questions:\n${formatted}`);
        }
      } catch (err) {
        console.error("Failed to fetch AI context", err);
      }
    };
    fetchCatalogForAI();
  }, []);

  // ReactMarkdown completely handles rendering images, lists, and formatting now.
  const MarkdownRenderer = ({ text }) => (
    <ReactMarkdown
      components={{
        img: ({node, ...props}) => <img {...props} className="w-full h-auto object-cover rounded-xl my-3 shadow-md border border-gray-200 dark:border-gray-700" />,
        p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
        li: ({node, ...props}) => <li className="pl-1" {...props} />,
        strong: ({node, ...props}) => <strong className="font-semibold text-gray-900 dark:text-white" {...props} />,
        a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />
      }}
    >
      {text}
    </ReactMarkdown>
  );

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { text: userMessage, isBot: false }]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("Missing Groq API Key");
      }

      const systemInstruction = `You are a friendly, professional, and knowledgeable sales and support assistant for "Suraj Sewing Machine". 
Your goal is to provide exceptional customer service. Always greet the customer warmly and be incredibly polite, helpful, and patient.
When asked about machines in stock, present the options clearly using bullet points, emojis, and nice formatting. Highlight key features to make the products sound appealing.
If asked about a specific machine, give a detailed but easy-to-read explanation based on the live inventory data provided.
CRITICAL INSTRUCTION: If you recommend or talk about a specific machine, you MUST include its exactly matching Image URL at the end of your description using standard markdown format: ![Machine Name](Image URL).
Never mention that you are an AI. Speak as if you are a real expert team member at Suraj Sewing Machine. Keep responses well-structured and concise.
Here is our live product catalog data you can use to answer questions:${productsContext}`;
      
      const requestBody = {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userMessage }
        ]
      };

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      let reply = "Sorry, I couldn't process that.";
      if (data.choices && data.choices.length > 0) {
        reply = data.choices[0].message.content;
      }

      setMessages((prev) => [...prev, { text: reply, isBot: true }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { text: "Sorry, I'm having trouble connecting. Please try again later.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white p-4 flex justify-center items-center rounded-full shadow-2xl transform transition hover:scale-105">
          <MessageCircle size={28} />
        </button>
      )}

      {isOpen && (
        <div className="bg-white dark:bg-gray-800 w-80 sm:w-96 h-[500px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
            <h3 className="font-bold text-lg flex items-center"><MessageCircle size={20} className="mr-2" /> Suraj Sewing Machine</h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200 transition-colors"><X size={20} /></button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.isBot ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-sm' : 'bg-blue-600 text-white rounded-br-none shadow-md'}`}>
                  {msg.isBot ? <MarkdownRenderer text={msg.text} /> : msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none animate-pulse flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about our machines..." className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full disabled:opacity-50 transition-colors"><Send size={18} /></button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotUI;
