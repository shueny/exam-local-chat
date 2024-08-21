import "@radix-ui/themes/styles.css";
import * as Form from "@radix-ui/react-form";
import { Theme, TextField, Dialog } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import Chat from "./components/chat";

function App() {
  const [username, setUsername] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      setIsOpen(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem("username", username);
      setIsOpen(false);
    }
  };

  return (
    <Theme appearance="dark">
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
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
      {!isOpen && <Chat username={username} />}
    </Theme>
  );
}

export default App;
