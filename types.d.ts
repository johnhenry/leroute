// Represents a route handler function
export type LouteRoute = (
  request: Request,
  context?: Record<string, any>
) => Response | Promise<Response>;

// Extension for the LouteRouter to add endpoints
export type LouteRouterExtension = {
  endpoint: (template: TemplateStringsArray, ...substitutions: any[]) => LouteRouter;
};

// Combines LouteRoute and LouteRouterExtension
export type LouteRouter = LouteRoute & LouteRouterExtension;

// Configuration options for a LouteRoute
export type LouteRouteInit = {
  headers?: HeadersInit | Headers;
  status?: number;
  statusText?: string;
  streaming?: boolean;
};

// Middleware for LouteRoute
export type LouteRouteMiddleware = LouteRouteInit | ((request: Request) => LouteRouteInit);

// Function to create a LouteRoute
export type CreateLouteRoute = (
  init?: LouteRouteMiddleware
) => (template: TemplateStringsArray, ...substitutions: any[]) => LouteRoute;

// Configuration options for a LouteRouter
export type LouteRouterInit = {
  baseUrl?: string;
  defaultHandler?: LouteRoute;
  errorHandler?: (
    error: Error,
    request: Request
  ) => Response | Promise<Response>;
  cache?: CacheOptions;
};

// Middleware for LouteRouter
export type LouteRouterMiddleware = LouteRouterInit | ((request: Request) => LouteRouterInit);

// Function to create a LouteRouter
export type CreateLouteRouter = (init?: LouteRouterMiddleware) => LouteRouter;

// Cache options
export type CacheOptions = {
  // Add cache-related options here
};

// InlineParam options
export type InlineParamOptions = {
  name: string;
  optional?: boolean;
  type?: "string" | "number" | "boolean";
  default?: any;
  cast?: (value: string) => any;
  max?: number;
  min?: number;
  array?: boolean;
  delimiter?: string;
};

// HeaderMatch options
export type HeaderMatchOptions = {
  name: string;
  value?: string;
  operator?: "=" | "^=" | "$=" | "~=" | "*=" | ">" | "<" | ">=" | "<=";
  negate?: boolean;
  set?: string[];
  range?: [number, number];
  rangeInclusive?: [boolean, boolean];
};

export type InlineParam = (options: InlineParamOptions) => string;
export type HeaderMatch = (options: HeaderMatchOptions) => string;
