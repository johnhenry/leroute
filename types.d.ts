type CreateRouteSignature = (
  init: PhrouteInit
) => (template: TemplateStringsArray) => Phroute;

type CreateRouterSignature = (init: PhrouterInit) => Phrouter;

////

// Represents a route handler function
type Phoute = (
  request: Request,
  context?: Record<string, any>
) => Response | Promise<Response>;

// Extension for the Phrouter to add endpoints
type PhrouterExtension = {
  endpoint: (template: TemplateStringsArray | Phroute) => void;
};

// Combines Phoute and PhrouterExtension
type Phrouter = Phoute & PhrouterExtension;

// Configuration options for a Phroute
type PhrouteInit = {
  headers?: HeadersInit | Headers;
  status?: number;
  statusText?: string;
  streaming?: boolean;
};

// Middleware for Phroute
type PhrouteMiddleware = PhrouteInit | ((request: Request) => PhrouteInit);

// Function to create a Phroute
type CreateRoute = (
  init?: PhrouteMiddleware
) => (template: TemplateStringsArray, ...substitutions: any[]) => Phroute;

// Configuration options for a Phrouter
type PhrouterInit = {
  baseUrl: string;
  defaultHandler: Phroute;
  errorHandler: (
    error: Error,
    request: Request
  ) => Response | Promise<Response>;
  cache: CacheOptions;
};

// Middleware for Phrouter
type PhrouterMiddleware = PhrouterInit | ((request: Request) => PhrouterInit);

// Function to create a Phrouter
type CreateRouter = (init?: PhrouterMiddleware) => Phrouter;

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
