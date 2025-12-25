import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllChats, getChatById, toggleAI } from "../utills/apiHelper";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  TextField,
  Stack,
  Button,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  FormControlLabel,
  Switch,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import MessageIcon from "@mui/icons-material/Message";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAIMode, setIsAIMode] = useState(false);
  const [socket, setSocket] = useState(null);

  const { data: chatsData, isLoading, refetch } = useQuery(
    ["chats"],
    () => getAllChats(),
    {
      refetchInterval: 5000,
    }
  );

  const { data: chatData, refetch: refetchChat } = useQuery(
    ["chat", selectedChat],
    () => getChatById(selectedChat),
    {
      enabled: !!selectedChat,
    }
  );

  const toggleAIMutation = useMutation(
    ({ chatId, aiEnabled }) => toggleAI(chatId, aiEnabled),
    {
      onSuccess: () => {
        refetchChat();
        queryClient.invalidateQueries(["chats"]);
      },
    }
  );

  const currentChat = chatData?.chat;
  const aiEnabled = currentChat?.aiEnabled ?? true;

  useEffect(() => {
    if (chatData) {
      setMessages(chatData.messages || []);
    }
  }, [chatData]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("admin-new-message", (message) => {
      if (selectedChat && message.chatId === selectedChat) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === message.id);
          if (exists) {
            return prev.map((msg) => msg.id === message.id ? message : msg);
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
      }
    });

    newSocket.on("chat-updated", () => {
      refetch();
      if (selectedChat) {
        refetchChat();
      }
    });

    return () => {
      newSocket.close();
    };
  }, [selectedChat, refetch, refetchChat]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socket || !selectedChat) return;

    const messageContent = inputMessage.trim();
    setInputMessage("");

    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      sender: isAIMode ? "ai" : "admin",
      isAI: isAIMode,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    socket.emit("admin-send-message", {
      chatId: selectedChat,
      content: messageContent,
      isAI: isAIMode,
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button
            color="inherit"
            startIcon={<MessageIcon />}
            onClick={() => navigate("/admin/messages")}
            sx={{ mr: 2 }}
          >
            All Messages
          </Button>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Box
          sx={{
            width: 350,
            borderRight: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6">Chats</Typography>
          </Box>
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : chatsData?.chats?.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>
              No chats available
            </Alert>
          ) : (
            <List>
              {chatsData?.chats?.map((chat) => (
                <React.Fragment key={chat.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={selectedChat === chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {chat.sessionId.substring(0, 20)}...
                            </Typography>
                            <Chip
                              label={chat.status}
                              size="small"
                              color={chat.status === "active" ? "success" : "default"}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            {chat.lastMessage && (
                              <Typography variant="caption" noWrap>
                                {chat.lastMessage.content.substring(0, 50)}
                                {chat.lastMessage.content.length > 50 ? "..." : ""}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {chat.updatedAt
                                ? formatTime(chat.updatedAt)
                                : formatTime(chat.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedChat ? (
          <>
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "grey.50",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <Box>
                  <Typography variant="h6">
                    Chat: {chatsData?.chats?.find((c) => c.id === selectedChat)?.sessionId}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {chatsData?.chats?.find((c) => c.id === selectedChat)?.userIp && (
                      <>IP: {chatsData.chats.find((c) => c.id === selectedChat).userIp}</>
                    )}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={aiEnabled}
                      onChange={(e) => {
                        toggleAIMutation.mutate({
                          chatId: selectedChat,
                          aiEnabled: e.target.checked,
                        });
                      }}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <SmartToyIcon fontSize="small" />
                      <Typography variant="body2">AI Auto-Reply</Typography>
                    </Box>
                  }
                />
              </Box>
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
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: "flex",
                      justifyContent: message.sender === "user" ? "flex-start" : "flex-end",
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "70%",
                        bgcolor:
                          message.sender === "user"
                            ? "white"
                            : message.isAI
                            ? "warning.main"
                            : "primary.main",
                        color: message.sender === "user" ? "text.primary" : "white",
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
                          {formatTimeShort(message.createdAt)}
                        </Typography>
                        {message.isAI && (
                          <Chip
                            label="AI"
                            size="small"
                            color="warning"
                            sx={{ height: 16, fontSize: "0.65rem" }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
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
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAIMode}
                      onChange={(e) => setIsAIMode(e.target.checked)}
                      color="warning"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SmartToyIcon fontSize="small" />
                      <Typography variant="body2">Send as AI</Typography>
                    </Box>
                  }
                />
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={isAIMode ? "Type AI message..." : "Type a message..."}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    color={isAIMode ? "warning" : "primary"}
                    startIcon={isAIMode ? <SmartToyIcon /> : null}
                  >
                    {isAIMode ? "Send AI" : "Send"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Select a chat to view messages
            </Typography>
          </Box>
        )}
        </Box>
      </Box>
    </Box>
  );
}

