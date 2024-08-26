export default async function (request) {
  return new Response("Product created", {
    status: 201,
    headers: { "Content-Type": "text/plain" },
  });
}
