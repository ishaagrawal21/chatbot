import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Avatar,
  Stack,
  CircularProgress,
  Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function ChatbotWidget({ externalOpen }) {
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    if (externalOpen === true) {
      setOpen(true);
    }
  }, [externalOpen]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    const storedSessionId = localStorage.getItem("chatSessionId");
    const userAgent = navigator.userAgent;

    if (storedSessionId) {
      setSessionId(storedSessionId);
      newSocket.emit("join-chat", {
        sessionId: storedSessionId,
        userAgent,
      });
    } else {
      newSocket.emit("join-chat", {
        userAgent,
      });
    }

    newSocket.on("session-created", (data) => {
      setSessionId(data.sessionId);
      localStorage.setItem("chatSessionId", data.sessionId);
    });

    newSocket.on("chat-history", (data) => {
      if (data && data.messages) {
        setMessages(data.messages || []);
      }
    });

    newSocket.on("new-message", (message) => {
      if (!message || !message.id) return;
      
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === message.id);
        if (exists) {
          return prev.map((msg) => 
            msg.id === message.id ? message : msg
          );
        }
        const tempExists = prev.some((msg) => 
          msg.id?.startsWith("temp-") && 
          msg.content === message.content && 
          msg.sender === message.sender
        );
        if (tempExists) {
          return prev.map((msg) => 
            msg.id?.startsWith("temp-") && 
            msg.content === message.content && 
            msg.sender === message.sender
              ? message
              : msg
          );
        }
        return [...prev, message];
      });
      setIsTyping(false);
    });

    newSocket.on("typing-start", (data) => {
      if (data.sender === "admin") {
        setIsTyping(true);
      }
    });

    newSocket.on("typing-stop", (data) => {
      if (data.sender === "admin") {
        setIsTyping(false);
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, isTyping]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socket) return;

    const messageContent = inputMessage.trim();
    setInputMessage("");

    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      sender: "user",
      isAI: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    socket.emit("send-message", { content: messageContent });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {!open && (
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              width: 64,
              height: 64,
              "&:hover": {
                bgcolor: "primary.dark",
              },
              boxShadow: 3,
            }}
          >
            <ChatIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Box>
      )}

      {open && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 400,
            height: 600,
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "white",
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Chat Support</Typography>
            <IconButton
              onClick={() => {
                setOpen(false);
                if (externalOpen !== undefined) {
                  window.dispatchEvent(new CustomEvent('chat-closed'));
                }
              }}
              sx={{ color: "white" }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              bgcolor: "grey.50",
            }}
          >
            <Stack spacing={2}>
              {messages.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center">
                  Start a conversation with our support team
                </Typography>
              )}
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: "flex",
                    justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "75%",
                      bgcolor:
                        message.sender === "user"
                          ? "primary.main"
                          : message.isAI
                          ? "warning.main"
                          : "white",
                      color:
                        message.sender === "user"
                          ? "white"
                          : message.isAI
                          ? "white"
                          : "text.primary",
                      p: 1.5,
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    <Typography variant="body2">{message.content}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                          fontSize: "0.7rem",
                        }}
                      >
                        {formatTime(message.createdAt)}
                      </Typography>
                      {message.isAI && (
                        <Chip
                          label="AI"
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: "0.65rem",
                            bgcolor: "rgba(255,255,255,0.3)",
                            color: "white",
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
              {isTyping && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "white",
                      p: 1.5,
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    <CircularProgress size={16} />
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "white",
            }}
          >
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!socket}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !socket}
              >
                <SendIcon />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      )}
    </>
  );
}

