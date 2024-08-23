import WebSocket from "ws";
import http from "http";

const server = http.createServer();
const wss = new WebSocket.Server({ server });

interface ChatMessage {
  type: string;
  username: string;
  message: string;
  timestamp: number;
  content?: string | undefined;
  messages?: ChatMessage[] | undefined;
}

const chatHistory: ChatMessage[] = [];

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");
  ws.on("message", (message: WebSocket.RawData) => {
    console.log("Raw message received:", message.toString());
    try {
      const data = JSON.parse(message.toString()) as ChatMessage;
      console.log("Parsed message:", data);

      switch (data.type) {
        case "join":
          console.log(`${data.username} joined the chat`);
          break;
        case "message":
          console.log(`Message from ${data.username}: ${data.message}`);
          chatHistory.push(data);
          // Broadcast the message to all clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
          break;
        case "getHistory":
          console.log("Sending chat history");
          ws.send(JSON.stringify({ type: "history", messages: chatHistory }));
          break;
        default:
          console.warn("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env["PORT"] || 8080;

server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});
