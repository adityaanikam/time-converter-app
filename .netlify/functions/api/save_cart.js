const fs = require("fs");

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    const { cart } = JSON.parse(event.body);

    try {
        fs.writeFileSync("cart.json", JSON.stringify(cart));
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Cart saved successfully" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error saving cart" }),
        };
    }
};