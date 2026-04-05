import Stripe from 'stripe';

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { amount } = await req.json() as { amount: number };

  if (!amount || amount < 50) {
    return Response.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,           // cents
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
  });

  return Response.json({ clientSecret: paymentIntent.client_secret });
}
