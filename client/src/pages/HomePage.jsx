import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  AppBar,
  Toolbar,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SpeedIcon from "@mui/icons-material/Speed";
import SecurityIcon from "@mui/icons-material/Security";
import ChatbotWidget from "../components/ChatbotWidget";

export default function HomePage() {
  const [openChat, setOpenChat] = useState(false);

  const handleOpenChat = () => {
    setOpenChat(true);
  };

  React.useEffect(() => {
    const handleChatClosed = () => {
      setOpenChat(false);
    };
    window.addEventListener('chat-closed', handleChatClosed);
    return () => window.removeEventListener('chat-closed', handleChatClosed);
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <ChatIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Chatbot Support
          </Typography>
          <Button color="inherit" href="/admin/login">
            Admin Login
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 10,
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                Welcome to Our
                <br />
                Support Center
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Get instant help from our support team. We're here 24/7 to assist you
                with any questions or concerns.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                  onClick={handleOpenChat}
                >
                  Start Chatting
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ChatIcon sx={{ fontSize: 300, opacity: 0.3 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight="bold">
          Why Choose Us?
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Experience the best customer support
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                textAlign: "center",
                p: 3,
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <SupportAgentIcon
                  sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
                />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  24/7 Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our support team is available around the clock to help you
                  whenever you need assistance.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                textAlign: "center",
                p: 3,
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <SpeedIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Fast Response
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get instant responses to your queries. No waiting, no delays.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                textAlign: "center",
                p: 3,
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <SecurityIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Secure & Private
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your conversations are encrypted and kept confidential.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                textAlign: "center",
                p: 3,
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <ChatIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Easy to Use
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Simple and intuitive interface. Start chatting in seconds.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: "grey.100", py: 6 }}>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                How It Works
              </Typography>
              <Stack spacing={3} sx={{ mt: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    1. Click the Chat Button
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Find the chat widget in the bottom right corner of your screen.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    2. Start a Conversation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type your message and our support team will respond quickly.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    3. Get Help Instantly
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receive real-time assistance from our expert support agents.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  bgcolor: "white",
                  p: 4,
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Need Help?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Our support team is ready to assist you with any questions or
                  issues you may have. Click the chat button to get started!
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ChatIcon />}
                  onClick={handleOpenChat}
                >
                  Open Chat
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 4,
          mt: 8,
        }}
      >
        <Container>
          <Typography variant="body1" align="center">
            © 2024 Chatbot Support System. All rights reserved.
          </Typography>
        </Container>
      </Box>

      <ChatbotWidget externalOpen={openChat} />
    </Box>
  );
}

