import React, { useState, useEffect, useRef, useCallback } from "react";
import * as Form from "@radix-ui/react-form";
import { ScrollArea, Text, TextArea } from "@radix-ui/themes";

interface Message {
  username: string;
  content: string;
  timestamp: number;
}

interface ChatProps {
  username: string;
}

const Chat: React.FC<ChatProps> = ({ username }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [textAreaRows, setTextAreaRows] = useState(1);

  useEffect(() => {
    setMessages([
      {
        username: "System",
        content: `Welcome to the chat, ${username}!`,
        timestamp: Date.now(),
      },
    ]);
  }, [username]);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (isScrolledToBottom) {
      scrollToBottom();
    }
  }, [messages, isScrolledToBottom, scrollToBottom]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollHeight - scrollTop === clientHeight;
    setIsScrolledToBottom(isAtBottom);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = inputMessage.trim();
    if (trimmedMessage && !/^\s*$/.test(trimmedMessage)) {
      const newMessage: Message = {
        username,
        content: trimmedMessage,
        timestamp: Date.now(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage("");
      setIsScrolledToBottom(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        e.preventDefault();
        setTextAreaRows((prevRows) => prevRows + 1);
        const cursorPosition = e.currentTarget.selectionStart ?? 0;
        const updatedMessage =
          inputMessage.slice(0, cursorPosition) +
          "\n" +
          inputMessage.slice(cursorPosition);

        setInputMessage(updatedMessage);

        setTimeout(() => {
          if (e.target instanceof HTMLTextAreaElement) {
            e.target.selectionStart = (cursorPosition ?? 0) + 1;
            e.target.selectionEnd = (cursorPosition ?? 0) + 1;
          }
        }, 0);
      } else {
        e.preventDefault();
        handleSendMessage(e);
        setTextAreaRows(1);
      }
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ScrollArea
        ref={scrollAreaRef}
        style={{ flex: 1, padding: "16px" }}
        onScroll={handleScroll}
      >
        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: "8px" }}>
            <Text as="span" weight="bold">
              {message.username}:
            </Text>{" "}
            <Text as="span">{message.content}</Text>
          </div>
        ))}
      </ScrollArea>
      <Form.Root onSubmit={handleSendMessage} style={{ padding: "16px" }}>
        <TextArea
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={textAreaRows}
          style={{
            minHeight: textAreaRows === 1 ? "2rem" : "auto",
            width: "100%",
          }}
        />
      </Form.Root>
    </div>
  );
};

export default Chat;
