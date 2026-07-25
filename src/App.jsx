import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // 1. Create an empty list to hold our appointments
  const [appointments, setAppointments] = useState([]);

  // 2. This runs automatically when the page opens
  useEffect(() => {
    // Ask our Node.js server for the data
    axios.get('http://localhost:5000/api/appointments')
      .then((response) => {
        // Put the data into our list
        setAppointments(response.data);
      })
      .catch((error) => {
        console.log("Error fetching data:", error);
      });
  }, []);

  return (
    <div className="dashboard-container">
      <h1>🩺 Doctor Sharma's Dashboard</h1>
      <p>Live Patient Appointments</p>

      {/* 3. Build a table to show the data */}
      <table className="appointment-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Date</th>
            <th>Reason</th>
            <th>Time Slot</th>
          </tr>
        </thead>
        <tbody>
          {/* 4. Loop through the list and create a row for each appointment */}
          {appointments.length === 0 ? (
            <tr>
              <td colSpan="4" style={{textAlign: "center"}}>No appointments booked yet.</td>
            </tr>
          ) : (
            appointments.map((apt, index) => (
              <tr key={index}>
                <td>{apt.name}</td>
                <td>{apt.date || "Not set"}</td>
                <td>{apt.reason || "Not set"}</td>
                <td>{apt.time_slot || "Not set"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;