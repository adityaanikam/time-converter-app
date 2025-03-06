from flask import Flask, request, jsonify, send_from_directory
import json
import os
from datetime import datetime
import pytz
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Timezone mapping for countries
# Timezone mapping for countries
TIMEZONE_MAP = {
    # United States Timezones
    "US-Eastern": "America/New_York",       # Eastern Time (ET)
    "US-Central": "America/Chicago",        # Central Time (CT)
    "US-Mountain": "America/Denver",        # Mountain Time (MT)
    "US-Pacific": "America/Los_Angeles",    # Pacific Time (PT)
    "US-Alaska": "America/Anchorage",       # Alaska Time (AKT)
    "US-Hawaii": "Pacific/Honolulu",        # Hawaii-Aleutian Time (HST)

    # European Countries
    "UK": "Europe/London",                  # United Kingdom (GMT/BST)
    "Germany": "Europe/Berlin",             # Germany (CET/CEST)
    "France": "Europe/Paris",               # France (CET/CEST)
    "Italy": "Europe/Rome",                 # Italy (CET/CEST)
    "Spain": "Europe/Madrid",               # Spain (CET/CEST)
    "Netherlands": "Europe/Amsterdam",      # Netherlands (CET/CEST)
    "Switzerland": "Europe/Zurich",         # Switzerland (CET/CEST)
    "Sweden": "Europe/Stockholm",           # Sweden (CET/CEST)
    "Norway": "Europe/Oslo",                # Norway (CET/CEST)
    "Finland": "Europe/Helsinki",           # Finland (EET/EEST)
    "Denmark": "Europe/Copenhagen",         # Denmark (CET/CEST)
    "Poland": "Europe/Warsaw",              # Poland (CET/CEST)
    "Austria": "Europe/Vienna",             # Austria (CET/CEST)
    "Belgium": "Europe/Brussels",           # Belgium (CET/CEST)
    "Portugal": "Europe/Lisbon",            # Portugal (WET/WEST)
    "Ireland": "Europe/Dublin",             # Ireland (GMT/IST)
    "Greece": "Europe/Athens",              # Greece (EET/EEST)
    "Czech Republic": "Europe/Prague",      # Czech Republic (CET/CEST)
    "Hungary": "Europe/Budapest",           # Hungary (CET/CEST)
    "Romania": "Europe/Bucharest",          # Romania (EET/EEST)
    "Bulgaria": "Europe/Sofia",             # Bulgaria (EET/EEST)
    "Croatia": "Europe/Zagreb",             # Croatia (CET/CEST)
    "Serbia": "Europe/Belgrade",            # Serbia (CET/CEST)
    "Slovakia": "Europe/Bratislava",        # Slovakia (CET/CEST)
    "Slovenia": "Europe/Ljubljana",         # Slovenia (CET/CEST)
    "Estonia": "Europe/Tallinn",            # Estonia (EET/EEST)
    "Latvia": "Europe/Riga",                # Latvia (EET/EEST)
    "Lithuania": "Europe/Vilnius",          # Lithuania (EET/EEST)
    "Luxembourg": "Europe/Luxembourg",      # Luxembourg (CET/CEST)
    "Malta": "Europe/Malta",                # Malta (CET/CEST)
    "Cyprus": "Asia/Nicosia",               # Cyprus (EET/EEST)

}
# Path to store cart data
CART_FILE = "cart.json"

# Ensure cart.json exists
if not os.path.exists(CART_FILE):
    with open(CART_FILE, 'w') as f:
        json.dump([], f)

@app.route('/')
def serve_index():
    return send_from_directory('.', 'static/index.html')

@app.route('/convert_time', methods=['POST'])
def convert_time():
    """Convert the current time from a selected country's timezone to IST."""
    country = request.json.get('country')  # Changed to JSON input

    # Validate country input
    if not country or country not in TIMEZONE_MAP:
        return jsonify({'error': 'Invalid or unsupported country'}), 400

    try:
        # Get the timezone for the selected country
        source_timezone = pytz.timezone(TIMEZONE_MAP[country])
        ist_timezone = pytz.timezone('Asia/Kolkata')  # IST timezone

        # Get the current time in the selected country's timezone
        local_time = datetime.now(source_timezone)

        # Convert to IST
        ist_time = local_time.astimezone(ist_timezone)

        # Format times as HH:MM AM/PM
        local_time_str = local_time.strftime('%I:%M %p')  # 12-hour format with AM/PM
        ist_time_str = ist_time.strftime('%I:%M %p')     # 12-hour format with AM/PM

        return jsonify({
            'local_time': local_time_str,
            'ist_time': ist_time_str
        }), 200

    except Exception as e:
        return jsonify({'error': f'Error converting time: {str(e)}'}), 500

@app.route('/save_cart', methods=['POST'])
def save_cart():
    """Save the cart to a JSON file."""
    try:
        cart = request.json.get('cart', [])
        with open(CART_FILE, 'w') as f:
            json.dump(cart, f)
        return jsonify({'message': 'Cart saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Error saving cart: {str(e)}'}), 500

@app.route('/get_cart', methods=['GET'])
def get_cart():
    """Retrieve the cart from the JSON file."""
    try:
        with open(CART_FILE, 'r') as f:
            cart = json.load(f)
        return jsonify({'cart': cart}), 200
    except Exception as e:
        return jsonify({'error': f'Error retrieving cart: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)