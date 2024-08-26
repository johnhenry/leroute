export default async function (request) {
  return new Response("List of products", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
