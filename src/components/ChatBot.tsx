import { MessageCircle, X, Send } from 'lucide-react';
import { useState } from 'react';

interface ChatBotProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isDarkMode?: boolean;
}

export function ChatBot({ isOpen, setIsOpen, isDarkMode = false }: ChatBotProps) {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I\'m your WcDonald HR Assistant. How can I help you today?' },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;

    setMessages([...messages, { type: 'user', text: inputValue }]);
    
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { 
          type: 'bot', 
          text: 'I can help you with questions about your schedule, leave requests, payroll, or HR policies. What would you like to know?' 
        },
      ]);
    }, 500);

    setInputValue('');
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 hover:scale-110 flex items-center justify-center z-50 animate-bounce"
        >
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      {isOpen && (
        <div className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-96 h-[100vh] md:h-[500px] md:rounded-lg shadow-2xl flex flex-col z-50 border-t md:border transition-all duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="bg-red-600 text-white p-4 md:rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <div>HR Assistant</div>
                <div className="text-xs text-red-100">Online</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-red-700 p-2 rounded transition-all duration-300 transform hover:rotate-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom duration-300`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg transition-all duration-300 ${
                    msg.type === 'user'
                      ? 'bg-red-600 text-white rounded-br-none'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-100 rounded-bl-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className={`p-4 border-t transition-colors duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-all duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
              />
              <button
                onClick={handleSend}
                className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-all duration-300 flex-shrink-0 transform hover:scale-110"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setInputValue('What is my schedule?')}
                className={`text-xs px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                My Schedule
              </button>
              <button 
                onClick={() => setInputValue('How do I request leave?')}
                className={`text-xs px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Request Leave
              </button>
              <button 
                onClick={() => setInputValue('Check my payroll')}
                className={`text-xs px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Payroll
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}