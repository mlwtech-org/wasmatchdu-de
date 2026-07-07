"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createStripeCheckoutSession = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
// @ts-ignore
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
    apiVersion: "2024-06-20",
});
const corsHandler = require("cors")({ origin: true });
exports.createStripeCheckoutSession = functions.https.onRequest((req, res) => {
    // @ts-ignore
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
                            currency: "usd",
                            product_data: {
                                name: "WasMatchDu Pro Access",
                                description: "Secure VPN Access and Premium Channels",
                            },
                            unit_amount: 999,
                            recurring: {
                                interval: "month",
                            },
                        },
                        quantity: 1,
                    },
                ],
                customer_email: email,
                client_reference_id: uid,
                success_url: `https://wasmatch-du.web.app/dashboard?upgrade=success`,
                cancel_url: `https://wasmatch-du.web.app/dashboard?upgrade=canceled`,
            });
            res.status(200).json({ url: session.url });
        }
        catch (error) {
            console.error("Error creating checkout session:", error);
            res.status(500).send("Internal Server Error");
        }
    });
});
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_dummy";
    let event;
    try {
        // Stripe requires the raw body to construct the event
        // Firebase provides req.rawBody
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    }
    catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    try {
        switch (event.type) {
            case "checkout.session.completed":
                const session = event.data.object;
                const uid = session.client_reference_id;
                const customerId = session.customer;
                if (uid) {
                    console.log(`Upgrading user ${uid} to Pro...`);
                    await admin.firestore().collection("users").doc(uid).set({
                        isPro: true,
                        stripeCustomerId: customerId,
                        subscriptionStatus: "active",
                    }, { merge: true });
                }
                break;
            case "customer.subscription.deleted":
            case "customer.subscription.updated":
                const subscription = event.data.object;
                const subCustomerId = subscription.customer;
                // Find user by customerId
                const usersSnapshot = await admin.firestore()
                    .collection("users")
                    .where("stripeCustomerId", "==", subCustomerId)
                    .get();
                if (!usersSnapshot.empty) {
                    const userDoc = usersSnapshot.docs[0];
                    const isActive = subscription.status === "active" || subscription.status === "trialing";
                    await userDoc.ref.update({
                        isPro: isActive,
                        subscriptionStatus: subscription.status,
                    });
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        res.status(200).send({ received: true });
    }
    catch (err) {
        console.error("Error processing webhook:", err);
        res.status(500).send("Internal Server Error");
    }
});
//# sourceMappingURL=stripe.js.map