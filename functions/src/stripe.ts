import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import cors from "cors";

// @ts-expect-error - ignore typing mismatch
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2024-06-20" as unknown as Stripe.LatestApiVersion,
});

const corsHandler = cors({ origin: true });

export const createStripeCheckoutSession = functions.https.onRequest(
  (req, res) => {
    // @ts-expect-error - ignore typing mismatch
    corsHandler(req, res, async () => {
      try {
        const { uid, email } = req.body;
        if (!uid) {
          res.status(400).send("User ID is required");
          return;
        }

        // Create a checkout session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "subscription",
          line_items: [
            {
              price_data: {
                currency: "usd", // Using USD for example, user can change this
                product_data: {
                  name: "WasMatchDu Pro Access",
                  description: "Secure VPN Access and Premium Channels",
                },
                unit_amount: 999, // $9.99
                recurring: {
                  interval: "month",
                },
              },
              quantity: 1,
            },
          ],
          customer_email: email, // Pre-fill email
          client_reference_id: uid, // To identify user in webhook
          success_url: `https://wasmatch-du.web.app/dashboard?upgrade=success`,
          cancel_url: `https://wasmatch-du.web.app/dashboard?upgrade=canceled`,
        });

        res.status(200).json({ url: session.url });
      } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).send("Internal Server Error");
      }
    });
  },
);

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_dummy";

  let event;
  try {
    // Stripe requires the raw body to construct the event
    // Firebase provides req.rawBody
    event = stripe.webhooks.constructEvent(
      (req as unknown as { rawBody: Buffer }).rawBody,
      sig,
      webhookSecret,
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Webhook Error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
    } else {
      res.status(400).send(`Webhook Error`);
    }
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id;
        const customerId = session.customer as string;

        if (uid) {
          console.log(`Upgrading user ${uid} to Pro...`);
          await admin.firestore().collection("users").doc(uid).set(
            {
              isPro: true,
              stripeCustomerId: customerId,
              subscriptionStatus: "active",
            },
            { merge: true },
          );
        }
        break;
      }

      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subCustomerId = subscription.customer as string;

        // Find user by customerId
        const usersSnapshot = await admin
          .firestore()
          .collection("users")
          .where("stripeCustomerId", "==", subCustomerId)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          const isActive =
            subscription.status === "active" ||
            subscription.status === "trialing";

          await userDoc.ref.update({
            isPro: isActive,
            subscriptionStatus: subscription.status,
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    res.status(500).send("Internal Server Error");
  }
});
