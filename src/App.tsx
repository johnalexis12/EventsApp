import React from 'react';
import logo from './logo.svg';
import './App.css';

import EventsCreation from './components/eventsCreation';


function App() {
  return (
    <div className="App">
      <div className='event-container'>
        <EventsCreation />
      </div>
    </div>
  );
}

export default App;
