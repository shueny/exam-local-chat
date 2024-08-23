import "@radix-ui/themes/styles.css";
import * as Form from "@radix-ui/react-form";
import { Theme, TextField, Dialog } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import Chat from "./components/chat";
import { initializeWebSocket, WebSocketWrapper } from "./lib/utils/web-socket";

function App() {
  const [username, setUsername] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [socket, setSocket] = useState<WebSocketWrapper | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      setIsOpen(false);
      const ws = initializeWebSocket(storedUsername);
      setSocket(ws);
      ws.onerror = (error) => console.error("WebSocket error:", error);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem("username", username);
      setIsOpen(false);
      try {
        const newSocket = await initializeWebSocket(username);
        setSocket(newSocket);
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
      }
    }
  };

  return (
    <Theme appearance="dark" panelBackground="solid">
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Content style={{ maxWidth: 450 }} aria-describedby="">
          <Dialog.Title className="DialogTitle">Chat login</Dialog.Title>
          <Form.Root onSubmit={handleLogin}>
            <TextField.Root
              size="2"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Root>
        </Dialog.Content>
      </Dialog.Root>
      {!isOpen && socket && <Chat username={username} socket={socket} />}
    </Theme>
  );
}

export default App;
