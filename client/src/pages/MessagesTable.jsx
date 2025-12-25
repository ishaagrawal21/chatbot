import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllMessages } from "../utills/apiHelper";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Stack,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function MessagesTable() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [senderFilter, setSenderFilter] = useState("");
  const [chatIdFilter, setChatIdFilter] = useState("");

  const { data, isLoading, error, refetch } = useQuery(
    ["messages", senderFilter, chatIdFilter],
    () => getAllMessages({ sender: senderFilter || undefined, chatId: chatIdFilter || undefined }),
    {
      refetchInterval: 5000,
    }
  );

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getSenderLabel = (sender) => {
    switch (sender) {
      case "user":
        return "User";
      case "admin":
        return "Admin";
      case "ai":
        return "AI";
      default:
        return sender;
    }
  };

  const getSenderColor = (sender) => {
    switch (sender) {
      case "user":
        return "primary";
      case "admin":
        return "success";
      case "ai":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => navigate("/admin/dashboard")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            All Messages
          </Typography>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, flex: 1, overflow: "auto" }}>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Sender</InputLabel>
            <Select
              value={senderFilter}
              label="Sender"
              onChange={(e) => setSenderFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="ai">AI</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Chat ID"
            value={chatIdFilter}
            onChange={(e) => setChatIdFilter(e.target.value)}
            placeholder="Filter by chat ID"
            sx={{ minWidth: 200 }}
          />

          <Button
            variant="outlined"
            onClick={() => {
              setSenderFilter("");
              setChatIdFilter("");
            }}
          >
            Clear Filters
          </Button>

          <Button variant="contained" onClick={() => refetch()}>
            Refresh
          </Button>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Error loading messages</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Message</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Sender</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Session ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.messages?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No messages found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.messages?.map((message) => (
                    <TableRow key={message.id} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 400,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {message.content}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getSenderLabel(message.sender)}
                          color={getSenderColor(message.sender)}
                          size="small"
                        />
                        {message.isAI && (
                          <Chip
                            label="AI"
                            color="warning"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {message.sessionId || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(message.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {data?.messages && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Total messages: {data.messages.length}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

