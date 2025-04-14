export type LoginFormData = {
  email: string;
  password: string;
  // Optionally, you might include:
  rememberMe?: boolean; // For "remember me" functionality
};

export type RegisterFormData = {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
};
