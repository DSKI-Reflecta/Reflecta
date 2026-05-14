import React, { useState, useEffect, useRef } from 'react'; // Added useEffect and useRef
import { MessageCircle, Send, X } from 'lucide-react';

// Added onClose prop to allow closing from within the component
const AIChat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: "Hello! I'm your journal assistant. How are you feeling today?" }
  ]);
  const [userMessage, setUserMessage] = useState("");

  // Ref for the messages area to enable auto-scrolling
  const messagesEndRef = useRef(null);

  // Scroll to the latest message whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSend = () => {
    if (userMessage.trim()) {
      // Add user message
      const updatedMessages = [...messages, { sender: 'user', text: userMessage }];
      setMessages(updatedMessages);
      setUserMessage(""); // Clear input

      // Simulate assistant response after a short delay
      setTimeout(() => {
        // This is where you would normally make an API call for a real response
        let responseText = "I understand presentations can be stressful. Would you like some tips for managing presentation anxiety or help preparing content?";

        // Simple response logic based on user's last message
        if (updatedMessages.length === 2) {
          responseText = "I understand presentations can be stressful. Would you like some tips for managing presentation anxiety or help preparing content?";
        } else if (updatedMessages.length === 4) {
          responseText = "Here are some tips: • Take deep breaths before starting • Visualize success beforehand • Start with a personal story • Focus on connecting with individuals in the audience • Remember to pause and hydrate Would you like me to recommend a breathing technique?";
        } else {
             responseText = "That's interesting. Tell me more!"; // Default response
        }

        setMessages(prev => [...prev, { sender: 'assistant', text: responseText }]);
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    // Removed max-w-lg and mx-auto from here, positioning is handled by parent in App.js
    // Added max-h-[90vh] and w-full max-w-lg to control size within the modal context
    <div className="flex flex-col w-full max-w-lg max-h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0"> {/* Added flex-shrink-0 */}
        <h3 className="text-lg font-semibold flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-purple-600" />
          Journal Assistant
        </h3>
        {/* Use the onClose prop */}
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages area */}
      {/* Ensured this area grows and is scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            // Adjusted max-w to be relative to its container (the messages area)
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
        {/* This div is the target for scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {/* Ensured this area doesn't shrink */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0"> {/* Added flex-shrink-0 */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message your assistant..."
            className="flex-1 py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSend}
            className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed" // Added disabled styles
            disabled={!userMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
