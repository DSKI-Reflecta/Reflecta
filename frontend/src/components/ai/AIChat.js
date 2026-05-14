import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { sendChatMessage } from '../../api/api';

const AIChat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: "Hello! I'm your journal assistant. How are you feeling today?" }
  ]);
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSend = async () => { // Made handleSend async
    if (userMessage.trim()) {
      const newUserMessage = userMessage;
      setMessages(prevMessages => [...prevMessages, { sender: 'user', text: newUserMessage }]);
      setUserMessage(""); // Clear input
      setIsLoading(true); // Set loading to true

      try {
        // Call the backend API
        const assistantResponse = await sendChatMessage(newUserMessage);
        setMessages(prevMessages => [...prevMessages, { sender: 'assistant', text: assistantResponse }]);
      } catch (error) {
        console.error("Error sending message to chatbot:", error);
        setMessages(prevMessages => [...prevMessages, { sender: 'assistant', text: "Sorry, I couldn't get a response right now." }]);
      } finally {
        setIsLoading(false); // Set loading to false
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col w-full max-w-lg max-h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-purple-600" />
          Journal Assistant
        </h3>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[75%] ${message.sender === 'user' ? 'ml-auto' : ''}`}
          >
            <div
              className={`p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-gray-100 rounded-tr-none'
                  : 'bg-purple-100 rounded-tl-none'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center">
            <div className="loader"></div> {/* Add a CSS class for a loader */}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isLoading ? "Waiting for response..." : "Message your assistant..."}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading} // Disable input while loading
          />
          <button
            onClick={handleSend}
            className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!userMessage.trim() || isLoading} // Disable button while empty or loading
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;