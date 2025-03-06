const { DateTime } = require("luxon");

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    const { country } = JSON.parse(event.body);

    const TIMEZONE_MAP = {
        // Your timezone mappings here
    };

    if (!TIMEZONE_MAP[country]) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid or unsupported country" }),
        };
    }

    try {
        const localTime = DateTime.now().setZone(TIMEZONE_MAP[country]);
        const istTime = localTime.setZone("Asia/Kolkata");

        return {
            statusCode: 200,
            body: JSON.stringify({
                local_time: localTime.toFormat("hh:mm a"),
                ist_time: istTime.toFormat("hh:mm a"),
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error converting time" }),
        };
    }
};