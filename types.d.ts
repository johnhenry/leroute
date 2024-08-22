type Phoute = (request: Request) => Response | Promise<Response>;
type PhrouterExtension = {
  endpoint: (template: TemplateStringsArray | Phroute) => void;
};
type Phrouter = Phroute & PhrouterExtension;
type PhrouteInit = {
  headers: HeadersInit | Headers;
  status: number;
  statusText: string;
  baseUrl: string;
};
type CreateRouteSignature = (
  init: PhrouteInit
) => (template: TemplateStringsArray) => Phroute;
type PhrouterInit = {};
type CreateRouterSignature = (init: PhrouterInit) => Phrouter;
