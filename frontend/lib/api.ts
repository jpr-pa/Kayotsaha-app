import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const loginUser = async (form: { email: string; password: string }) => {
  const res = await axios.post(`${API_BASE}/api/login`, form);
  return res.data;
};

export const registerUser = async (form: {
  username: string;
  email: string;
  mobile: string;
  password: string;
}) => {
  const res = await axios.post(`${API_BASE}/api/register`, form);
  return res.data;
};


export const verifyOtp = async ({ otp }: { otp: string }) => {
  const res = await axios.post(`${API_BASE}/api/verify-otp`, { otp });
  return res.data;
};

export const resendOtp = async () => {
  const res = await axios.post(`${API_BASE}/api/resend-otp`);
  return res.data;
};

export const verifyForgotPasswordOtp = async ({ otp }: { otp: string }) => {
  const res = await axios.post(`${API_BASE}/api/verify-forgot-password-otp`, { otp });
  return res.data;
};

export const resetForgotPassword = async ({ newPassword }: { newPassword: string }) => {
  const res = await axios.post(`${API_BASE}/api/reset-password`, { newPassword });
  return res.data;
};

export const resendForgotPasswordOtp = async ({ identifier }: { identifier: string | null }) => {
  const res = await axios.post(`${API_BASE}/api/resend-forgot-otp`, { identifier });
  return res.data;
};


