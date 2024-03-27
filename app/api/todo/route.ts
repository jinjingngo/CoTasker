export async function GET(request: Request) {
  return new Response("Todos!", {
    status: 200,
  });
}
