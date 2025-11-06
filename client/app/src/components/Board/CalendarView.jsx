import React, { useState } from 'react';
import '../../styles/board-views.css';

const CalendarView = ({ board, onCardClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get all cards with due dates
  const cardsWithDates = board.columns.flatMap(column =>
    (column.cards || [])
      .filter(card => card.due_date)
      .map(card => ({
        ...card,
        columnName: column.title,
        columnId: column.id
      }))
  );

  // Calendar helpers
  const getMonthData = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const monthLength = lastDay.getDate();

    return { year, month, firstDay, lastDay, startingDayOfWeek, monthLength };
  };

  const { year, month, startingDayOfWeek, monthLength } = getMonthData(currentDate);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get cards for a specific day
  const getCardsForDay = (day) => {
    return cardsWithDates.filter(card => {
      const cardDate = new Date(card.due_date);
      return (
        cardDate.getDate() === day &&
        cardDate.getMonth() === month &&
        cardDate.getFullYear() === year
      );
    });
  };

  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Check if date is overdue
  const isOverdue = (day) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Build calendar grid
  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= monthLength; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <div className="calendar-controls">
          <button className="calendar-nav-btn" onClick={goToPreviousMonth}>
            ‹
          </button>
          <h2 className="calendar-title">
            {monthNames[month]} {year}
          </h2>
          <button className="calendar-nav-btn" onClick={goToNextMonth}>
            ›
          </button>
        </div>
        <button className="calendar-today-btn" onClick={goToToday}>
          Today
        </button>
      </div>

      <div className="calendar-grid">
        {/* Day names header */}
        {dayNames.map(day => (
          <div key={day} className="calendar-day-name">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="calendar-day empty" />;
          }

          const dayCards = getCardsForDay(day);
          const today = isToday(day);
          const overdue = isOverdue(day) && dayCards.length > 0;

          return (
            <div
              key={day}
              className={`calendar-day ${today ? 'today' : ''} ${overdue ? 'overdue' : ''}`}
            >
              <div className="calendar-day-number">{day}</div>
              {dayCards.length > 0 && (
                <div className="calendar-day-cards">
                  {dayCards.slice(0, 3).map(card => (
                    <div
                      key={card.id}
                      className="calendar-card"
                      onClick={() => onCardClick(card)}
                      title={card.title}
                    >
                      <span className="calendar-card-title">{card.title}</span>
                    </div>
                  ))}
                  {dayCards.length > 3 && (
                    <div className="calendar-card-more">
                      +{dayCards.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="calendar-legend-item">
          <div className="calendar-legend-dot today-dot"></div>
          <span>Today</span>
        </div>
        <div className="calendar-legend-item">
          <div className="calendar-legend-dot overdue-dot"></div>
          <span>Overdue</span>
        </div>
        <div className="calendar-legend-item">
          <div className="calendar-legend-dot cards-dot"></div>
          <span>Has cards</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
