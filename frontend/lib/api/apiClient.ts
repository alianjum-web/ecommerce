import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
} from "axios";
import { cookies } from "next/headers";
import { AuthError } from "../errors/auth-error";
import { useAppSelector } from "@/store/hooks";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const PUBLIC_ROUTES = [
  "/shopping/home",
  "/shopping/listing",
  "/shopping/search",
  "/auth/login",
  "/auth/register",
  "/unauth-page",
  "/not-found",
];

// Base API client configuration
const baseConfig: AxiosRequestConfig = {
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Create base API client
export const apiClient: AxiosInstance = axios.create(baseConfig);

apiClient.interceptors.request.use(async (config) => {
  // Skip auth headers for public routes
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    config.url?.startsWith(route)
  );

  if (isPublicRoute) {
    return config;
  }

  // Add auth headers for protected routes
  if (typeof window !== "undefined") {
    // Client-side auth handling
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// response interseptor for  API client
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      throw new AuthError(
        "Unauthorized",
        typeof window !== "undefined" ? window.location.pathname : "/"
      );
    }
    return Promise.reject(error);
  }
);

// Server Side Api client
export async function serverApiClient(): Promise<AxiosInstance> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const instance = axios.create({
    ...baseConfig,
    headers: {
      ...baseConfig.headers,
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        throw new AuthError("Unauthorized", "/");
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

// Client-side API hook
export function useApiClient(): AxiosInstance {
  const { user } = useAppSelector((state) => state.auth);

  const client = axios.create(baseConfig);

  client.interceptors.request.use((config) => {
    // Skip auth headers for public routes
    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      config.url?.startsWith(route)
    );
    if (!isPublicRoute && user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        throw new AuthError(
          "Unauthorized",
          typeof window !== "undefined" ? window.location.pathname : "/"
        );
      }
      return Promise.reject(error);
    }
  );
  return client;
}


// Utility function for the public API calls
export function publicApiClient(): AxiosInstance {
  return axios.create(baseConfig);
}