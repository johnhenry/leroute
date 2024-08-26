// Represents a route handler function
export type LeRoute = (
  request: Request,
  context?: Record<string, any>
) => Response | Promise<Response>;

// Extension for the LeRouter to add endpoints
export type LeRouterExtension = {
  endpoint: (
    template: TemplateStringsArray,
    ...substitutions: any[]
  ) => LeRouter;
};

// Combines LeRoute and LeRouterExtension
export type LeRouter = LeRoute & LeRouterExtension;

// Configuration options for a LeRoute
export type LeRouteInit = {
  headers?: HeadersInit | Headers;
  status?: number;
  statusText?: string;
  streaming?: boolean;
};

// Middleware for LeRoute
export type LeRouteMiddleware =
  | LeRouteInit
  | ((request: Request) => LeRouteInit);

// Function to create a LeRoute
export type CreateLeRoute = (
  init?: LeRouteMiddleware
) => (template: TemplateStringsArray, ...substitutions: any[]) => LeRoute;

// Configuration options for a LeRouter
export type LeRouterInit = {
  baseUrl?: string;
  defaultHandler?: LeRoute;
  errorHandler?: (
    error: Error,
    request: Request
  ) => Response | Promise<Response>;
  cache?: CacheOptions;
};

// Middleware for LeRouter
export type LeRouterMiddleware =
  | LeRouterInit
  | ((request: Request) => LeRouterInit);

// Function to create a LeRouter
export type CreateLeRouter = (init?: LeRouterMiddleware) => LeRouter;

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
