import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

const FullCalendarComponent = ({ id, def }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.post('/calendar-events', { defensoriaId: def });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleDateSelect = async (selectInfo) => {
    let title = prompt('Please enter a title for your event');
    if (title) {
      const newEvent = {
        defensoria_id: def,
        user_id: id,
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      };

      try {
        const response = await axios.post('/add-calendar-event', newEvent);
        setEvents([...events, { ...newEvent, id: response.data.eventId }]);
      } catch (error) {
        console.error('Error adding event:', error);
        alert('Error adding event. Please try again.');
      }
    }
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = async (clickInfo) => {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      try {
        await axios.delete(`/delete-calendar-event/${clickInfo.event.id}`);
        setEvents(events.filter(event => event.id !== clickInfo.event.id));
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event. Please try again.');
      }
    }
  };

  const handleEventChange = async (changeInfo) => {
    try {
      await axios.put(`/update-calendar-event/${changeInfo.event.id}`, {
        title: changeInfo.event.title,
        start: changeInfo.event.start,
        end: changeInfo.event.end,
        allDay: changeInfo.event.allDay
      });
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event. Please try again.');
    }
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventChange={handleEventChange}
      />
    </div>
  );
};

export default FullCalendarComponent;