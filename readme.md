```javascript
const oneshot = await fetch(
  req()`GET http://www.google.com/hello.htm HTTP/1.1`
);
const google = req({ baseUrl: "https://google.com" });
const recycled0 = await fetch(google`GET /hello.htm HTTP/1.1
User-Agent: Mozilla/4.0 (compatible; MSIE5.01; Windows NT)
Host: www.tutorialspoint.com
Accept-Language: en-us
Accept-Encoding: gzip, deflate
Connection: Keep-Alive)`);
const recycled0 = await fetch(googleRequest`POST /hello.htm HTTP/1.1
User-Agent: Mozilla/4.0 (compatible; MSIE5.01; Windows NT)
Host: www.tutorialspoint.com
Accept-Language: en-us
Accept-Encoding: gzip, deflate
Connection: Keep-Alive)`);
```

```javascript
const oneshot = (request) =>
  res()`HTTP/1.1 200 OK

OK!`;
const error = res()`HTTP/1.1 404 Not Found
Date: Sun, 18 Oct 2012 10:36:20 GMT
Server: Apache/2.2.14 (Win32)

URL not found`;

const liveError = res.live()`
HTTP/1.1 404 Not Found
Date: Sun, 18 Oct 2012 10:36:20 GMT

${(request) => request.url} not found.`;

let phrouter;

phrouter.endpoint`GET /hello.htm`((request) => error.clone());
phrouter.endpoint`GET /hello.htm`(liveError);
phrouter.endpoint`GET /hello.htm``
HTTP/1.1 404 Not Found
Date: Sun, 18 Oct 2012 10:36:20 GMT

${(request) => request.url} not found.`;

phrouter.endpoint`GET /:id [content-type:application/json]``
HTTP/1.1 404 Not Found
Date: Sun, 18 Oct 2012 10:36:20 GMT

<!DOCTYPE html>
<html>
  <head>
    <title>404 Not Found</title>
  </head>
  <body>
    <h1>Not Found</h1>
    <p>The requested URL ${(request) =>
      request.url} was not found on this server.</p>
  </body>
</html>
`;

const id = ParameterMatch({
  name: "id",
  match: /^[0-9]+$/,
  default: 0,
  type: "number",
});

phrouter.endpoint`GET /${id} [content-type:application/json]``
HTTP/1.1 404 Not Found
Date: Sun, 18 Oct 2012 10:36:20 GMT

<!DOCTYPE html>
<html>
  <head>
    <title>404 Not Found</title>
  </head>8i4
  <body>
    <h1>Not Found</h1>
    <p>The requested URL ${(request) =>
      request.url} was not found on this server.</p>
  </body>
</html>
`;

// the presence of "HTTTP/*" or "<" as the first non-white-space character
// dictates whether or not we are in "head" mode or "HTML" mode.
// In raw mode we write all heaers
// In HTML mode, everything is defaulted (content-type: text/html, etc)
```
