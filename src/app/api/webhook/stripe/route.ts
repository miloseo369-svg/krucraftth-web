import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // TODO: Verify Stripe webhook signature
  // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );

  try {
    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const courseId = session.metadata?.course_id;

      if (userId && courseId) {
        await supabase.from("enrollments").upsert({
          user_id: userId,
          course_id: courseId,
        });

        // Handle affiliate commission
        const affiliateCode = session.metadata?.affiliate_code;
        if (affiliateCode) {
          const { data: affiliate } = await supabase
            .from("affiliates")
            .select("*")
            .eq("referral_code", affiliateCode)
            .single();

          if (affiliate) {
            const amount = (session.amount_total / 100) * affiliate.commission_rate;
            await supabase.from("affiliate_payouts").insert({
              affiliate_id: affiliate.id,
              order_id: session.id,
              commission_amount: amount,
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
