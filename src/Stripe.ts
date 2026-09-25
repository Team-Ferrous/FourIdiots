export const StripeConfig = {
    publishableKey: "pk_test_REPLACE_ME",
    supporterPriceId: "price_REPLACE_ME"
};

export function isStripeConfigured(): boolean {
    return (
        StripeConfig.publishableKey !== "pk_test_REPLACE_ME" &&
        StripeConfig.supporterPriceId !== "price_REPLACE_ME"
    );
}

export async function startStripeCheckout(): Promise<void> {
    if (!isStripeConfigured()) {
        throw new Error("Stripe is not configured.");
    }

    const response = await fetch(
        "/api/stripe/create-checkout-session",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                priceId: StripeConfig.supporterPriceId
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            Stripe checkout failed: ${response.status}
        );
    }

    const result = await response.json();

    if (!result.url) {
        throw new Error(
            "Stripe did not return a checkout URL."
        );
    }

    window.location.href = result.url;
}
