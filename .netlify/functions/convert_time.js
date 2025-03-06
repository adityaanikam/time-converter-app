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
        "US-Eastern": "America/New_York",
        "US-Central": "America/Chicago",
        "US-Mountain": "America/Denver",
        "US-Pacific": "America/Los_Angeles",
        "US-Alaska": "America/Anchorage",
        "US-Hawaii": "Pacific/Honolulu",
        "UK": "Europe/London",
        "Germany": "Europe/Berlin",
        "France": "Europe/Paris",
        "Italy": "Europe/Rome",
        "Spain": "Europe/Madrid",
        "Netherlands": "Europe/Amsterdam",
        "Switzerland": "Europe/Zurich",
        "Sweden": "Europe/Stockholm",
        "Norway": "Europe/Oslo",
        "Finland": "Europe/Helsinki",
        "Denmark": "Europe/Copenhagen",
        "Poland": "Europe/Warsaw",
        "Austria": "Europe/Vienna",
        "Belgium": "Europe/Brussels",
        "Portugal": "Europe/Lisbon",
        "Ireland": "Europe/Dublin",
        "Greece": "Europe/Athens",
        "Czech Republic": "Europe/Prague",
        "Hungary": "Europe/Budapest",
        "Romania": "Europe/Bucharest",
        "Bulgaria": "Europe/Sofia",
        "Croatia": "Europe/Zagreb",
        "Serbia": "Europe/Belgrade",
        "Slovakia": "Europe/Bratislava",
        "Slovenia": "Europe/Ljubljana",
        "Estonia": "Europe/Tallinn",
        "Latvia": "Europe/Riga",
        "Lithuania": "Europe/Vilnius",
        "Luxembourg": "Europe/Luxembourg",
        "Malta": "Europe/Malta",
        "Cyprus": "Asia/Nicosia",
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