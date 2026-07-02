import { STRAPI_URL } from "@/lib/strapi";

function uploadError(status: number) {
  const tokenHint = process.env.STRAPI_API_TOKEN
    ? "Check that STRAPI_API_TOKEN has permission to upload files in Strapi."
    : "Add STRAPI_API_TOKEN to .env.local or enable Upload permissions in Strapi.";

  return Response.json(
    {
      error: `Could not upload file. Status: ${status}. ${tokenHint}`,
    },
    { status },
  );
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const headers = new Headers();
  const token = process.env.STRAPI_API_TOKEN;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    return uploadError(res.status);
  }

  return new Response(await res.arrayBuffer(), {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}
