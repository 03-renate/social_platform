/**
 * @file types/index.ts
 * @description This file contains all the TypeScript types and interfaces used in the application.
 * It includes definitions for user authentication, application state, and custom error types.
 * @note This code is taken from a boiler-plate created by Monde Sineke.
 * @author Your Name
 */

import type { Post } from './noroff-types';

// Authentication related interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  bio?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  errors?: ApiError[];
  meta?: {
    isFirstPage: boolean;
    isLastPage: boolean;
    currentPage: number;
    previousPage: number | null;
    nextPage: number | null;
    pageCount: number;
    totalCount: number;
  };
}

export interface LoginResponse {
  name: string;
  email: string;
  bio: string | null;
  avatar: {
    url: string;
    alt: string;
  } | null;
  banner: {
    url: string;
    alt: string;
  } | null;
  accessToken: string;
}

export interface RegisterResponse {
  name: string;
  email: string;
  bio: string | null;
  avatar: {
    url: string;
    alt: string;
  } | null;
  banner: {
    url: string;
    alt: string;
  } | null;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  image: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoggedIn: boolean;
  // https://docs.noroff.dev/docs/v2/authentication
  accessToken: string;
  refreshToken: string;
  apiKey: string;
}

export interface AppState {
  posts: Post[];
  auth?: AuthState;
  currentPage?: string;
}

export interface Meta {
  barcode: string;
  createdAt: Date;
  qrCode: string;
  updatedAt: Date;
}

// Form validation interfaces
export interface FormElements {
  email: HTMLInputElement;
  password: HTMLInputElement;
  name?: HTMLInputElement;
  bio?: HTMLTextAreaElement;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: string[];
}

// Create a clean object to send to our service
export interface ErrorReport {
  message: string;
  stack: string;
  timestamp: string;
  url: string;
}

// ## Define our custom error types

export class ValidationError extends Error {
  constructor(message: string) {
    // Call the parent constructor
    super(message);
    // Set the error name to the class name
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}
