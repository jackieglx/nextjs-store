import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
import {type NextRequest} from 'next/server';
import db from '@/utils/db';

export const POST = async (req: NextRequest) => {
    const requestHeaders = new Headers(req.headers);

    // dynamically get the origin of the request,
    // which refers to the base URL (protocol, domain, and port) from which the request originated
    // http://localhost:3000/checkout, the origin will be http://localhost:3000.
    const origin = requestHeaders.get('origin');

    const {orderId, cartId} = await req.json();

    const order = await db.order.findUnique({
        where: {
            id: orderId,
        },
    });
    const cart = await db.cart.findUnique({
        where: {
            id: cartId,
        },
        include: {
            cartItems: {
                include: {
                    product: true,
                },
            },
        },
    });
    if (!order || !cart) {
        return Response.json(null, {
            status: 404,
            statusText: 'Not Found',
        });
    }

    //  You need to construct the line_items in this format
    //  because Stripe's API expects the line_items to follow a specific structure when creating a checkout session.
    const line_items = cart.cartItems.map((cartItem) => {
        return {
            quantity: cartItem.amount,
            price_data: {
                currency: 'usd',
                product_data: {
                    name: cartItem.product.name,
                    //  Stripe's API expects the images field to be an array of URLs, even if you're only providing a single image
                    images: [cartItem.product.image],
                },
                unit_amount: cartItem.product.price * 100, // price in cents
            },
        };
    });

    // This is where the backend sends a POST request to Stripe's API to create a new Checkout Session.
    //
    try {
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            metadata: {orderId, cartId},
            line_items: line_items,
            mode: 'payment',
            // The return_url in this context is used to specify
            // where Stripe will redirect the user after they complete or cancel the payment process.
            return_url: `${origin}/api/confirm?session_id={CHECKOUT_SESSION_ID}`,
        });
        // The response from Stripe contains important information like client_secret,
        // which is needed for the client to complete the payment process.
        return Response.json({clientSecret: session.client_secret});
    } catch (error) {
        console.log(error);

        return Response.json(null, {
            status: 500,
            statusText: 'Internal Server Error',
        });
    }
};