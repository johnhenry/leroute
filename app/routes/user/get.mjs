export default async function (request) {
  return new Response("List of users", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
