import React, { useEffect, useState } from "react";

interface ChatEntryProps {
  onEnter: (username: string) => void;
}

const ChatEntry: React.FC<ChatEntryProps> = ({ onEnter }) => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onEnter(username.trim());
    }
  };

  return (
    <div>
      <h2>Enter Chat Room</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your name"
          required
          // className="w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          // className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Join Chat
        </button>
      </form>
    </div>
  );
};

export default ChatEntry;
