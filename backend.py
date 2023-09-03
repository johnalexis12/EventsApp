from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

events = []

def validate_event(event):
    try:
        title = event.get('title')
        start_time = datetime.fromisoformat(event['start_time'])
        end_time = datetime.fromisoformat(event['end_time'])

        if not title:
            return "Title is required."

        if start_time >= end_time:
            return "Start time must be before end time."

        # Start/End checker (8am/8pm)
        if (
            start_time.time() < datetime.strptime('08:00:00', '%H:%M:%S').time()
            or end_time.time() > datetime.strptime('20:00:00', '%H:%M:%S').time()
        ):
            return "Event time is outside the allowed range (8 AM - 8 PM)."

        for existing_event in events:
            existing_start_time = datetime.fromisoformat(existing_event['start_time'])
            existing_end_time = datetime.fromisoformat(existing_event['end_time'])
            if (
                start_time < existing_end_time
                and end_time > existing_start_time
            ):
                return "Event overlaps with an existing event."

        return None  # Validation passed
    except (KeyError, ValueError):
        return "Invalid date format or missing fields."

@app.route("/events", methods=["POST"])
def create_event():
    try:
        event_data = request.json
        validation_result = validate_event(event_data)
        if validation_result:
            return jsonify({"error": validation_result}), 400

        event_id = str(uuid.uuid4())
        event_data['id'] = event_id

        events.append(event_data)
        return jsonify({"message": "Event created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/events/<event_id>", methods=["DELETE"])
def delete_event(event_id):
    try:
        event_index = None
        for i, event in enumerate(events):
            if event.get('id') == event_id:
                event_index = i
                break
        if event_index is not None:
            del events[event_index]
            return jsonify({"message": "Event deleted successfully"})
        else:
            return jsonify({"error": "Event not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/events", methods=["GET"])
def list_events():
    return jsonify(events)

@app.route("/events/<event_id>", methods=["PUT"])
def update_event(event_id):
    try:
        event_data = request.json
        event_index = None
        for i, event in enumerate(events):
            if event.get('id') == event_id:
                event_index = i
                break
        if event_index is not None:
            validation_result = validate_event(event_data)
            if validation_result:
                return jsonify({"error": validation_result}), 400

            # Update event data
            events[event_index].update(event_data)
            
            return jsonify({"message": "Event updated successfully"})
        else:
            return jsonify({"error": "Event not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8080)
