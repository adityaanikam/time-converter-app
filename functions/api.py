import json
import os
from flask import Flask, request, jsonify
from datetime import datetime
import pytz
import serverless_wsgi

app = Flask(__name__)

# Timezone mapping for countries
TIMEZONE_MAP = {
    "US": "America/New_York",  # Eastern Standard Time (EST)
    "UK": "Europe/London",      # Greenwich Mean Time (GMT)
    "AU": "Australia/Sydney",   # Australian Eastern Daylight Time (AEDT)
    "JP": "Asia/Tokyo",         # Japan Standard Time (JST)
    "DE": "Europe/Berlin",      # Central European Time (CET)
    "CA": "America/Toronto",    # Eastern Standard Time (EST)
    "ZA": "Africa/Johannesburg", # South African Standard Time (SAST)
    "BR": "America/Sao_Paulo"   # Brasília Time (BRT)
}

# Path to store cart data
CART_FILE = "cart.json"

# Ensure cart.json exists
if not os.path.exists(CART_FILE):
    with open(CART_FILE, 'w') as f:
        json.dump([], f)

@app.route('/convert_time', methods=['POST'])
def convert_time():
    """Convert a given local time from a country's timezone to IST"""
    country = request.form.get('country')
    local_time = request.form.get('local_time')

    # Validate inputs
    if not country or country not in TIMEZONE_MAP:
        return jsonify({'error': 'Invalid or unsupported country'}), 400

    if not local_time or not isinstance(local_time, str):
        return jsonify({'error': 'Invalid time format. Use HH:MM (24-hour)'}), 400

    try:
        # Parse the local time (HH:MM)
        local_time_obj = datetime.strptime(local_time, '%H:%M')
    except ValueError:
        return jsonify({'error': 'Invalid time format. Use HH:MM (24-hour)'}), 400

    try:
        # Get the timezone for the selected country
        source_timezone = pytz.timezone(TIMEZONE_MAP[country])
        ist_timezone = pytz.timezone('Asia/Kolkata')  # IST timezone

        # Get the current date to create a full datetime object
        current_date = datetime.now().date()
        local_datetime = datetime.combine(current_date, local_time_obj.time())

        # Localize the datetime to the source timezone (handles DST automatically)
        local_datetime_tz = source_timezone.localize(local_datetime)

        # Convert to IST
        ist_datetime = local_datetime_tz.astimezone(ist_timezone)

        # Format the IST time as HH:MM
        ist_time_str = ist_datetime.strftime('%H:%M')

        return jsonify({'ist_time': ist_time_str}), 200

    except Exception as e:
        return jsonify({'error': f'Error converting time: {str(e)}'}), 500

@app.route('/save_cart', methods=['POST'])
def save_cart():
    """Save the cart to a JSON file"""
    try:
        cart = request.json.get('cart', [])
        with open(CART_FILE, 'w') as f:
            json.dump(cart, f)
        return jsonify({'message': 'Cart saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Error saving cart: {str(e)}'}), 500

@app.route('/get_cart', methods=['GET'])
def get_cart():
    """Retrieve the cart from the JSON file"""
    try:
        with open(CART_FILE, 'r') as f:
            cart = json.load(f)
        return jsonify({'cart': cart}), 200
    except Exception as e:
        return jsonify({'error': f'Error retrieving cart: {str(e)}'}), 500

# Netlify Functions handler
def handler(event, context):
    return serverless_wsgi.handle_request(app, event, context)