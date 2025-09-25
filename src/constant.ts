/**
 * @file constant.ts
 * @description This file contains constant values used throughout the application.
 * @note This code is taken from a boiler-plate created by Monde Sineke.
 * @author Your Name
 */

export const BASE_URL = import.meta.env.BASE_URL || 'https://dummyjson.com';
export const API_URL = import.meta.env.API_URL || 'https://v2.api.noroff.dev';
export const SEARCH_URL =
  import.meta.env.SEARCH_URL ||
  'https://v2.api.noroff.dev/social/posts/search?q=<query>';
export const ANALYTICS_ENDPOINT =
  import.meta.env.ANALYTICS_ENDPOINT || 'c/eb3d-d728-4cdf-ab19';
export const FUNC_ERROR_TEXT = 'Expected a function';
export const LAZY_LOAD_CLASSNAME = 'js-lazy-load';
export const PLACEHOLDER_URL = '/10.svg';
export const APP_CONTAINER_CLASSNAME = 'js-app';

/**
 * An object containing media query breakpoints.
 *
 * @constant {Object} MEDIA_QUERIES
 * @property {600} xs - Extra small breakpoint (600px).
 * @property {800} s - Small breakpoint (800px).
 * @property {1000} m - Medium breakpoint (1000px).
 * @property {1200} l - Large breakpoint (1200px).
 */
export const MEDIA_QUERIES = {
  xs: 600,
  s: 800,
  m: 1000,
  l: 1200,
};
