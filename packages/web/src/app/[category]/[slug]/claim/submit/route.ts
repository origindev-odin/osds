import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BODY = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex">
  <title>Claim submit unavailable</title>
</head>
<body>
  <h1>Claim submit is not wired</h1>
  <p>This build does not run claim.submit. Nothing was saved.</p>
  <p><a href="/">Home</a></p>
</body>
</html>`;

export function POST(): NextResponse {
  return new NextResponse(BODY, {
    status: 501,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex",
    },
  });
}
