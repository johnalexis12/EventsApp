import React, { useState, useEffect } from 'react';
import './eventsCreation.css';

const EventsCreation: React.FC = () => {
  const [events, setEvents] = useState([]);
  const [eventData, setEventData] = useState({
    title: '',
    start_time: '',
    end_time: '',
  });
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    fetch('http://localhost:8080/events')
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error('Error fetching events:', error));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const formatTime = (dateTimeString: string) => {
    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const createEvent = () => {
    fetch('http://localhost:8080/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })
      .then((response) => response.json())
      .then((data) => {
        setModalMessage(data.message || data.error || 'Event created successfully');
        setModalOpen(true);
        fetchEvents();
      })
      .catch((error) => console.error('Error creating event:', error));
  };

  const deleteEvent = (event_id: string) => {
    fetch(`http://localhost:8080/events/${event_id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        setModalMessage(data.message || data.error || 'Event deleted successfully');
        setModalOpen(true);
        fetchEvents();
      })
      .catch((error) => console.error('Error deleting event:', error));
  };

  const updateEvent = () => {
    if (editingEvent && editingEvent.id) {
      fetch(`http://localhost:8080/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
        .then((response) => response.json())
        .then((data) => {
          setModalMessage(data.message || data.error || 'Event updated successfully');
          setModalOpen(true);
          fetchEvents();
          setEditingEvent(null);
        })
        .catch((error) => console.error('Error updating event:', error));
    }
  };

  return (
    <div className='container'>
      <div className='left-pane'>
        <h1>Event Manager</h1>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            placeholder='Event Title'
            value={eventData.title}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Start Time:</label>
          <input
            type="datetime-local"
            name="start_time"
            value={eventData.start_time}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>End Time:</label>
          <input
            type="datetime-local"
            name="end_time"
            value={eventData.end_time}
            onChange={handleInputChange}
          />
        </div>
        <button onClick={createEvent}>Create Event</button>
      </div>
      <div className='right-pane'>
        <h2>Events</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Starts</th>
              <th>Ends</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event: any) => (
              <tr key={event.id}>
                <td>
                  {editingEvent && editingEvent.id === event.id ? (
                    <input
                      type="text"
                      name="title"
                      value={eventData.title}
                      onChange={handleInputChange}
                    />
                  ) : (
                    event.title
                  )}
                </td>
                <td>{formatTime(event.start_time)}</td>
                <td>{formatTime(event.end_time)}</td>
                <td>
                  <button onClick={() => deleteEvent(event.id)}>Delete</button>
                </td>
                <td>
                  {editingEvent && editingEvent.id === event.id ? (
                    <button onClick={updateEvent}>Update</button>
                  ) : (
                    <button onClick={() => setEditingEvent(event)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModalOpen(false)}>
              &times;
            </span>
            <p>{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCreation;
