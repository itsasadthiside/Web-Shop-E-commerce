const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");

const app = express();
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cors({ origin: true, credentials: true }));

const stripe = require("stripe")("sk_test_51QVr6PGYqJKUkfo61cDGTHy1YWG9sLGFARBMvRkswdLogAgdCWcp3zjUjog9cgsCGDqE2K2PUaj2aD44Z5iZsZiZ00pPkdayH1 ");

app.post("/checkout", async (req, res, next) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            shipping_address_collection: {
                allowed_countries: ['IN', 'US', 'CA'], // Allow India (IN) as well
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 0, // Free shipping in INR (0 paise)
                            currency: 'inr',
                        },
                        display_name: 'Free shipping',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 5,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 7,
                            },
                        },
                    },
                },
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 150000, // 1500 INR in paise
                            currency: 'inr',
                        },
                        display_name: 'Next day air',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 1,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 1,
                            },
                        },
                    },
                },
            ],
            line_items: req.body.items.map((item) => ({
                price_data: {
                    currency: 'inr', // Set the currency to INR
                    product_data: {
                        name: item.name,
                        images: [item.product],
                    },
                    unit_amount: item.price * 100, // Convert to paise (1 INR = 100 paise)
                },
                quantity: item.quantity,
            })),
            mode: "payment",
            success_url: "http://localhost:4242/success.html",
            cancel_url: "http://localhost:4242/cancel.html",
        });

        res.status(200).json(session);
    } catch (error) {
        next(error);
    }
});

app.listen(4242, () => console.log('app is running on 4242'));
