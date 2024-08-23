import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Text,
  ScrollArea,
  TextArea,
  Flex,
  Grid,
  Spinner,
} from "@radix-ui/themes";
import { PersonIcon, FaceIcon } from "@radix-ui/react-icons";

import * as Form from "@radix-ui/react-form";
import { getRandomBotResponse } from "../lib/utils";

interface Message {
  type: string;
  username: string;
  message: string;
  timestamp: number;
  content?: string | undefined;
  messages?: Message[] | undefined;
}

interface ChatProps {
  username: string;
  socket: WebSocket;
}

function isMessage(data: unknown): data is Message {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    (data.type === "message" || data.type === "history")
  );
}

const Chat: React.FC<ChatProps> = ({ username, socket }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [textAreaRows, setTextAreaRows] = useState(1);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  useEffect(() => {
    socket.onmessage = (event) => {
      setLoadingMessages(true);
      const message = JSON.parse(event.data) as Message;
      setMessages((prev) => [...prev, message]);
      setLoadingMessages(false);
    };
  }, [socket]);

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
  }, [messages, isScrolledToBottom, scrollToBottom, inputMessage]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollHeight - scrollTop === clientHeight;
    setIsScrolledToBottom(isAtBottom);
  };

  useEffect(() => {
    if (!socket) {
      console.error("WebSocket is not initialized");
      return;
    }

    const handleOpen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      socket.send(JSON.stringify({ type: "getHistory" }));
    };

    const handleClose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("close", handleClose);

    const checkConnection = setInterval(() => {
      console.log("Current WebSocket readyState:", socket.readyState);
    }, 5000);

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (isMessage(data)) {
          if (data.type === "message") {
            if (data.username !== username) {
              setMessages((prevMessages) => {
                if (
                  !prevMessages.some((msg) => msg.timestamp === data.timestamp)
                ) {
                  return [...prevMessages, data];
                }
                return prevMessages;
              });
            }
          } else if (data.type === "history") {
            console.log("Received chat history:", data.messages);
            setMessages(data.messages || []);
          }
        } else {
          console.warn("Received unknown message type:", data);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("close", handleClose);
      socket.removeEventListener("message", handleMessage);
      clearInterval(checkConnection);
    };
  }, [socket, username]);

  useEffect(() => {
    if (!username) return;
    setMessages([
      {
        username: "Bot",
        timestamp: Date.now(),
        type: "message",
        message: `Welcome to the chat, ${username}!`,
      },
    ]);
  }, [username]);

  const sendMessage = useCallback(
    (message: string, username: string) => {
      const trimmedMessage = message.trim();
      if (trimmedMessage && !/^\s*$/.test(trimmedMessage)) {
        socket.send(
          JSON.stringify({
            type: "message",
            message: trimmedMessage,
            username: username,
            timestamp: Date.now(),
          }),
        );
        setInputMessage("");
        setShouldScrollToBottom(true);
        setIsScrolledToBottom(true);
      }
    },
    [username, socket],
  );

  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom, scrollToBottom]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputMessage(e.target.value);
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        if (e.shiftKey) {
          e.preventDefault();
          const cursorPosition = e.currentTarget.selectionStart ?? 0;
          const updatedMessage =
            inputMessage.slice(0, cursorPosition) +
            "\n" +
            inputMessage.slice(cursorPosition);

          setInputMessage(updatedMessage);

          setTimeout(() => {
            if (e.target instanceof HTMLTextAreaElement) {
              e.target.selectionStart = cursorPosition + 1;
              e.target.selectionEnd = cursorPosition + 1;
            }
          }, 0);
          setTextAreaRows((prevRows) => prevRows + 1);
        } else {
          e.preventDefault();
          sendMessage(inputMessage, username);
          setLoadingMessages(true);
          setTimeout(() => {
            const botResponse = getRandomBotResponse();
            if (botResponse) {
              sendMessage(botResponse, "Bot");
            }
          }, 1000);
          setTextAreaRows(1);
        }
      }
    },
    [inputMessage, sendMessage, username],
  );

  return (
    <Box
      p="4"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      {!isConnected && (
        <Text color="red" mb="5">
          Connecting to chat server...
        </Text>
      )}
      {!isConnected && loadingMessages && (
        <Flex
          align="center"
          justify="center"
          width="100vw"
          height="calc(100vh - 50px)"
          py="4"
        >
          <Spinner size="3" />
        </Flex>
      )}
      {isConnected && (
        <ScrollArea
          ref={scrollAreaRef}
          style={{ flex: 1 }}
          onScroll={handleScroll}
          id="chat-scroll-area"
        >
          {messages.map((msg, index) => {
            return (
              <Grid gap="1" key={index} mb="4">
                <Flex align="center">
                  <Flex
                    align={"center"}
                    justify={"center"}
                    style={{
                      background:
                        msg.username !== "Bot"
                          ? "var(--blue-7)"
                          : "var(--gray-11)",
                      width: "1.5rem",
                      height: "1.5rem",
                      borderRadius: "50%",
                    }}
                  >
                    {msg.username !== "Bot" ? (
                      <FaceIcon fill="var(--blue-11)" color="" />
                    ) : (
                      <PersonIcon color="var(--gray-5)" />
                    )}
                  </Flex>
                  <Text as="p" weight="bold" ml="2">
                    {msg.username}:
                  </Text>
                </Flex>
                <Text as="p" size="1" color="gray">
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleString()
                    : ""}
                </Text>
                <Text
                  as="p"
                  dangerouslySetInnerHTML={{
                    __html: msg.message.replace(/\n/g, "<br />"),
                  }}
                />
              </Grid>
            );
          })}
        </ScrollArea>
      )}
      <Form.Root>
        <TextArea
          placeholder="Type a message..."
          value={inputMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={textAreaRows === 1 ? 1 : undefined}
          style={{
            minHeight: textAreaRows === 1 ? "2rem" : "auto",
            width: "100%",
          }}
        />
      </Form.Root>
    </Box>
  );
};

export default Chat;
