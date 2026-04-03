// PayPal support removed. This endpoint intentionally returns 410 Gone.
export async function POST() {
  return new Response(JSON.stringify({ error: 'PayPal has been removed from this project' }), { status: 410, headers: { 'Content-Type': 'application/json' } });
}
