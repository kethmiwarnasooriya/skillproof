import apiClient from "./apiClient";

export const registerUser = async (userData) => {
  // Matches backend RegisterRequest DTO: fullName, email, password
  const payload = {
    fullName: userData.fullName,
    email: userData.email,
    password: userData.password,
  };

  const response = await apiClient.post("/auth/register", payload);
  return response.data;
};

export const loginUser = async ({ email, password }) => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data;
};
