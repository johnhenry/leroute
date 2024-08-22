const printRequesAndEcho = async (req) => {
  const { method, url, headers } = req;
  const body = await req.text();
  console.log(`${method} ${url}`);
  console.log([...headers]);
  console.log(body);
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain",
    },
  });
};

Deno.serve({ port: 8081 }, printRequesAndEcho);
