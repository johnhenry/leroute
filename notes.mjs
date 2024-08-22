I would iike to create a template function
that takes a template formatted as an http request
string and returns a javascript web request.

## Basic Format

```javascript
// create tagRequest
const request = await tagRequest({baseUrl:"http://example.com"})`POST /cgi-bin/process.cgi HTTP/1.1
User-Agent: Mozilla/4.0 (compatible; MSIE5.01; Windows NT)
Content-Type: text/xml; charset=utf-8
Content-Length: length
Accept-Language: en-us
Accept-Encoding: gzip, deflate
Connection: Keep-Alive

<?xml version="1.0" encoding="utf-8"?>
<string xmlns="http://clearforest.com/">string</string>
```

## Base Url

Note that we pass in a `baseURL` because this is a feautre of Javascript fetch request,
but not of the http request string.

However; `tagRequest` can infer this if passed as a part of preamble string as an extension of the http format:

```javascript
const request = await tagRequest()`POST http://example.com/cgi-bin/process.cgi HTTP/1.1
User-Agent: Mozilla/4.0 (compatible; MSIE5.01; Windows NT)
Content-Type: text/xml; charset=utf-8
Content-Length: length
Accept-Language: en-us
Accept-Encoding: gzip, deflate
Connection: Keep-Alive

<?xml version="1.0" encoding="utf-8"?>
<string xmlns="http://clearforest.com/">string</string>
```

Note that the `Host` header will be set from the `baseUrl` unless otherwise specified.

## Headers

In addition to being passed as string in the preamble,
headers may be passed as a headers object.

```javascript,
const request = await tagRequest()`
POST /cgi-bin/process.cgi HTTP/1.1
User-Agent: Mozilla/4.0 (compatible; MSIE5.01; Windows NT)
Host: www.tutorialspoint.com
Content-Type: text/xml; charset=utf-8
Content-Length: length
${new Headers({"Accept-Language": "en-us",
"Accept-Encoding": "gzip, deflate"})}
Connection: Keep-Alive
${new Headers(...)}

<?xml version="1.0" encoding="utf-8"?>
<string xmlns="http://clearforest.com/">string</string>
`;
```

## Body

In addition to being passed as string,
the body may take on anything that could be passed to the body of a fetch request.

```javascript,
const request = await tagRequest()`
POST /cgi-bin/process.cgi HTTP/1.1
Host: example.com
Content-Type: application/octet-stream;
Content-Length: length


${new Blob(...)}`;
```

## Retroactive headers

Unless the setRetroactiveHeaders option is set to false,
the headers may be set retroactively on the request object
based on the content of the body.

```javascript
const request = await tagRequest({setRetroactiveHeaders:true})`
POST /cgi-bin/process.cgi HTTP/1.1
Host: example.com
Content-Type: application/octet-stream;

This is plain text
` //

# Phrouter

## API Phroute

```typescript
import { createPhroute } from "./phrouter";
const route = createPhroute({headers, baseURL})`<!DOCTYPE html>
  <html>
    <body>
      <h1>User Profile</h1>
      <p>User ID: ${function () {
        return this.params("id");
      }}</p>
      <p>Query Param: ${function () {
        return this.search("foo") || "Not provided";
      }}</p>
    </body>
  </html>`;


const phrouter  = Phrouter();
phrouter.endpoint`GET /user/:id`route;
phrouter.endpoint`GET /user/:id?foo``<!DOCTYPE html>
<html></html>`;




router.endpoint`GET /user/123?foo=bar``${this.setHeader("Content-Type", "text/html")}
```
