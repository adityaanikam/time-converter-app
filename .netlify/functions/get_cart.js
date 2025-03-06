const fs = require("fs");

exports.handler = async (event, context) => {
    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    try {
        const cart = JSON.parse(fs.readFileSync("cart.json"));
        return {
            statusCode: 200,
            body: JSON.stringify({ cart }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error retrieving cart" }),
        };
    }
};