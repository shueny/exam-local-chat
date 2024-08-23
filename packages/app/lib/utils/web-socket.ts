const WS_URL = "ws://localhost:8080";

export type WebSocketWrapper = WebSocket;

export function initializeWebSocket(username: string): WebSocketWrapper {
  const socket = new WebSocket(WS_URL);

  socket.onopen = (event) => {
    console.log("WebSocket connection opened:", event);
    socket.send(JSON.stringify({ type: "join", username }));
  };

  socket.onmessage = (event) => {
    console.log("WebSocket message received:", event.data);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = (event) => {
    console.log("WebSocket connection closed:", event);
  };

  return socket;
}
