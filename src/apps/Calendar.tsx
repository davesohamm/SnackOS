// Beautiful Calendar with Events
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CalendarEvent } from '../core/types';
import './Calendar.css';

export const Calendar: React.FC = () => {
  const { events, addEvent, deleteEvent, calendarCommand, clearCalendarCommand } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  // Handle voice commands from Voice Assistant
  useEffect(() => {
    if (calendarCommand) {
      if (calendarCommand.type === 'navigate' && calendarCommand.month !== undefined && calendarCommand.year !== undefined) {
        setCurrentDate(new Date(calendarCommand.year, calendarCommand.month));
      } else if (calendarCommand.type === 'addEvent' && calendarCommand.eventTitle && calendarCommand.eventDate) {
        const event: CalendarEvent = {
          id: Date.now().toString(),
          title: calendarCommand.eventTitle,
          description: '',
          date: calendarCommand.eventDate,
          startTime: '',
          endTime: '',
          color: '#007aff',
        };
        addEvent(event);
        setCurrentDate(new Date(calendarCommand.eventDate));
        setSelectedDate(calendarCommand.eventDate);
      }
      clearCalendarCommand();
    }
  }, [calendarCommand, clearCalendarCommand, addEvent]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Handle create event
  const handleCreateEvent = () => {
    if (!newEvent.title || !selectedDate) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: selectedDate,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      color: '#007aff',
    };

    addEvent(event);
    setShowEventModal(false);
    setNewEvent({ title: '', description: '', startTime: '', endTime: '' });
  };

  // Handle delete event
  const handleDeleteEvent = (id: string) => {
    deleteEvent(id);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="calendar-app">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-title">
          <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button className="today-btn" onClick={goToToday}>
            Today
          </button>
        </div>
        <div className="calendar-nav">
          <button className="nav-btn" onClick={goToPreviousMonth}>
            <ChevronLeft size={20} />
          </button>
          <button className="nav-btn" onClick={goToNextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="calendar-content">
        {/* Calendar Grid */}
        <div className="calendar-grid-container">
          <div className="calendar-grid">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div key={day} className="week-day-header">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="calendar-day empty" />;
              }

              const dayEvents = getEventsForDate(date);
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={date.toISOString()}
                  className={`calendar-day ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}`}
                  onClick={() => handleDayClick(date)}
                >
                  <span className="day-number">{date.getDate()}</span>
                  {hasEvents && (
                    <div className="event-indicators">
                      {dayEvents.slice(0, 3).map(event => (
                        <div key={event.id} className="event-indicator" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Sidebar */}
        <div className="calendar-sidebar">
          <div className="sidebar-header">
            <h3>
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Select a date'}
            </h3>
            {selectedDate && (
              <button
                className="add-event-btn"
                onClick={() => setShowEventModal(true)}
              >
                <Plus size={18} />
              </button>
            )}
          </div>

          <div className="events-list">
            {selectedDateEvents.length === 0 ? (
              <div className="no-events">
                <p>No events for this day</p>
                {selectedDate && (
                  <button
                    className="create-event-btn"
                    onClick={() => setShowEventModal(true)}
                  >
                    <Plus size={18} />
                    Create Event
                  </button>
                )}
              </div>
            ) : (
              selectedDateEvents.map(event => (
                <div key={event.id} className="event-item">
                  <div className="event-time">
                    {event.startTime && event.endTime
                      ? `${event.startTime} - ${event.endTime}`
                      : 'All day'}
                  </div>
                  <div className="event-details">
                    <h4>{event.title}</h4>
                    {event.description && <p>{event.description}</p>}
                  </div>
                  <button
                    className="delete-event-btn"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Event</h3>
              <button className="modal-close" onClick={() => setShowEventModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEventModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateEvent}
                disabled={!newEvent.title}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





