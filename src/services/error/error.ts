/**
 * @file error.ts
 * @description This file contains error handling classes for the application.
 * @author [Your Name]
 */

export class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}
