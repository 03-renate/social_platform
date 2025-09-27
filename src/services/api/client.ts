/**
 * @file client.ts
 * @description API client for handling requests to the Noroff API (v2).
 * Handles authentication, API keys, JSON parsing, and errors.
 */

import { API_URL } from "../../constant";
import { getLocalItem } from "../../utils/storage";
import { ApiError } from "../error/error";
import type {
  LoginCredentials,
  RegisterData,
  ApiResponse,
  LoginResponse,
  RegisterResponse,
} from "../../types/index";

interface ApiClientOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | object | null;
}

type Endpoint = string;

const API_KEY_HEADER = "X-Noroff-API-Key";

/**
 * Generic API client for making HTTP requests.
 * Automatically attaches headers for JSON, API key, and access token.
 */
async function apiClient(endpoint: string, options: ApiClientOptions = {}) {
  const { body, ...customOptions } = options;

  const headers: Record<string, string> = {};

  const config: RequestInit = {
    method: body ? "POST" : "GET",
    ...customOptions,
    headers: {
      ...headers,
      ...(customOptions.headers as Record<string, string>),
    },
  };

  if (body) {
    if (body instanceof FormData) {
      // Let browser set Content-Type for FormData
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
      (config.headers as Record<string, string>)["Content-Type"] =
        "application/json";
    }
  }

  // Attach auth headers
  const apiKey = getLocalItem("apiKey");
  const accessToken = getLocalItem("accessToken");

  if (apiKey)
    (config.headers as Record<string, string>)[API_KEY_HEADER] = apiKey;
  if (accessToken)
    (config.headers as Record<string, string>)["Authorization"] =
      `Bearer ${accessToken}`;

  try {
    const response = await fetch(API_URL + endpoint, config);

    const contentType = response.headers.get("content-type");

    // Handle empty/204 responses
    if (
      response.status === 204 ||
      !contentType ||
      !contentType.includes("application/json")
    ) {
      if (!response.ok) {
        throw new ApiError(`HTTP Error: ${response.status}`, response.status);
      }
      return null;
    }

    const responseData = await response.json();

    if (!response.ok) {
      const message =
        responseData.errors?.[0]?.message || `HTTP Error: ${response.status}`;
      throw new ApiError(message, response.status);
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error("A network or client error occurred.");
  }
}

/* -------------------------------------------------------------------------- */
/*                               Helper Methods                               */
/* -------------------------------------------------------------------------- */

export const get = <T = unknown>(endpoint: Endpoint): Promise<T> =>
  apiClient(endpoint);

/**
 * POST request with JSON body.
 */
export const post = (endpoint: Endpoint, body: object) =>
  apiClient(endpoint, { method: "POST", body });

/**
 * PUT request with JSON body.
 */
export const put = (endpoint: Endpoint, body: object) =>
  apiClient(endpoint, { method: "PUT", body });

/**
 * DELETE request.
 */
export const del = (endpoint: Endpoint) =>
  apiClient(endpoint, { method: "DELETE" });

/* -------------------------------------------------------------------------- */
/*                          Auth Helper Functions                             */
/* -------------------------------------------------------------------------- */

/**
 * Registers a new user using the Noroff Auth API.
 */
export async function registerUser(
  data: RegisterData
): Promise<ApiResponse<RegisterResponse>> {
  const response = await fetch("https://v2.api.noroff.dev/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Logs in a user using the Noroff Auth API.
 */
export async function loginUser(
  data: LoginCredentials
): Promise<ApiResponse<LoginResponse>> {
  const response = await fetch("https://v2.api.noroff.dev/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Fetches a new API key using the Noroff Auth API.
 */
export async function fetchApiKey(
  accessToken: string
): Promise<string | undefined> {
  const response = await fetch(
    "https://v2.api.noroff.dev/auth/create-api-key",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch API key: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data?.data?.key;
}
