export default async function (request, { params }) {
  return new Response(`User details for ID: ${params.id}`, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
