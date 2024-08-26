type CreateRouteSignature = (
  init: LouteRouteInit
) => (template: TemplateStringsArray) => LouteRoute;

type CreateRouterSignature = (init: LouteRouterInit) => LouteRouter;

////

// Represents a route handler function
type LouteRoute = (
  request: Request,
  context?: Record<string, any>
) => Response | Promise<Response>;

// Extension for the LouteRouter to add endpoints
type LouteRouterExtension = {
  endpoint: (template: TemplateStringsArray | LouteRoute) => void;
};

// Combines LouteRoute and LouteRouterExtension
type LouteRouter = LouteRoute & LouteRouterExtension;

// Configuration options for a LouteRoute
type LouteRouteInit = {
  headers?: HeadersInit | Headers;
  status?: number;
  statusText?: string;
  streaming?: boolean;
};

// Middleware for LouteRoute
type LouteRouteMiddleware = LouteRouteInit | ((request: Request) => LouteRouteInit);

// Function to create a LouteRoute
type CreateRoute = (
  init?: LouteRouteMiddleware
) => (template: TemplateStringsArray, ...substitutions: any[]) => LouteRoute;

// Configuration options for a LouteRouter
type LouteRouterInit = {
  baseUrl: string;
  defaultHandler: LouteRoute;
  errorHandler: (
    error: Error,
    request: Request
  ) => Response | Promise<Response>;
  cache: CacheOptions;
};

// Middleware for LouteRouter
type LouteRouterMiddleware = LouteRouterInit | ((request: Request) => LouteRouterInit);

// Function to create a LouteRouter
type CreateRouter = (init?: LouteRouterMiddleware) => LouteRouter;

////////

// Existing types...

// InlineParam options
type InlineParamOptions = {
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
type HeaderMatchOptions = {
  name: string;
  value?: string;
  operator?: "=" | "^=" | "$=" | "~=" | "*=" | ">" | "<" | ">=" | "<=";
  negate?: boolean;
  set?: string[];
  range?: [number, number];
  rangeInclusive?: [boolean, boolean];
};

type InlineParam = (options: InlineParamOptions) => string;
type HeaderMatch = (options: HeaderMatchOptions) => string;
