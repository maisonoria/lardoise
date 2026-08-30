import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PRICE_ID = "price_1UA00oJ2BHFEBSUjJtuqUnfy";

export async function redirectToCheckout(userEmail) {
  const stripe = await stripePromise;

  const { error } = await stripe.redirectToCheckout({
    lineItems: [{ price: PRICE_ID, quantity: 1 }],
    mode: "subscription",
    successUrl: window.location.origin + "/app?success=true",
    cancelUrl: window.location.origin + "/app?canceled=true",
    customerEmail: userEmail,
  });

  if (error) {
    console.error("Stripe error:", error);
    alert("Erreur de paiement : " + error.message);
  }
}
