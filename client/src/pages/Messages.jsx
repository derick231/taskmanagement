import React, { useEffect, useState } from "react";
import socket from "../lib/socket.js";

export default function Messages() {
  const user = JSON.parse(localStorage.getItem("user"));
  const authToken = localStorage.getItem("authToken");

  const [receiverId, setReceiverId] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const api = "http://localhost:5000/api/chat";

  const createPersonalChat = async () => {
    const res = await fetch(`${api}/personal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        userA: user.id,
        userB: Number(receiverId),
      }),
    });

    const room = await res.json();
    setRoomId(room.id);

    socket.emit("join_room", room.id);

    loadMessages(room.id);
  };

  const loadMessages = async (room) => {
    const res = await fetch(`${api}/messages/${room}`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    await fetch(`${api}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        roomId,
        senderId: user.id,
        text,
      }),
    });

    setText("");
  };

  useEffect(() => {
    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("new_message");
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Messages</h2>

      {!roomId && (
        <div style={{ marginTop: 20 }}>
          <input
            placeholder="Receiver User ID"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
          />
          <button onClick={createPersonalChat}>Start Chat</button>
        </div>
      )}

      {roomId && (
        <>
          <div
            style={{
              border: "1px solid #ccc",
              padding: 10,
              marginTop: 20,
              height: 300,
              overflowY: "auto",
            }}
          >
            {messages.map((m) => (
              <div key={m.id}>
                <strong>
                  {m.senderId === user.id ? "You" : m.sender?.name}
                </strong>
                : {m.text}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 10 }}>
            <input
              placeholder="Type..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
}
