import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminLogin } from "../utills/apiHelper";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  TextField,
  Button,
  Stack,
  Alert,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import { useForm } from "react-hook-form";

export default function AdminLogin() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const loginMut = useMutation(adminLogin, {
    onSuccess: (data) => {
      login(data.admin, data.token);
      window.location.href = "/admin/dashboard";
    },
  });

  const onSubmit = (data) => {
    loginMut.mutate(data);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper sx={{ p: 4, width: "100%" }}>
          <Typography variant="h4" gutterBottom align="center">
            Admin Login
          </Typography>

          {loginMut.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginMut.error?.response?.data?.message || "Invalid credentials"}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <TextField
                label="Username"
                fullWidth
                {...register("username", { required: "Username is required" })}
                error={!!errors.username}
                helperText={errors.username?.message}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                {...register("password", { required: "Password is required" })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loginMut.isLoading}
                size="large"
              >
                {loginMut.isLoading ? "Logging in..." : "Login"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

