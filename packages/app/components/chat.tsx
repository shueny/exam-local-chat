import React, { useState, useEffect } from "react";
import ChatEntry from "./chat-entry";

const Chat: React.FC = () => {
  const [isInChat, setIsInChat] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const savedUsername = localStorage.getItem("chatUsername");
    if (savedUsername) {
      setUsername(savedUsername);
      setIsInChat(true);
    }
  }, []);

  const handleEnterChat = (enteredUsername: string) => {
    setUsername(enteredUsername);
    setIsInChat(true);

    localStorage.setItem("username", enteredUsername);
  };

  return (
    <div className="dark dark:bg-black">
      {!isInChat ? (
        <ChatEntry onEnter={handleEnterChat} />
      ) : (
        <div>Welcome to the chat, {username}!</div>
      )}
    </div>
  );
};

export default Chat;
