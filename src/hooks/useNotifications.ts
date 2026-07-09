import { useState, useEffect } from 'react';
import { Habit } from '../types';

export function useNotifications(habits: Habit[]) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('habitCal_notifications_enabled') === 'true';
  });

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('habitCal_notifications_enabled', 'true');
      } else {
        console.log('Notification permission denied');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('habitCal_notifications_enabled', 'false');
    }
  };

  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkHabits = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // We only want to notify once per minute, and only if the habit is scheduled for today
      habits.forEach(habit => {
        if (habit.timeStart === currentTime) {
          // Check if the habit is scheduled for today (frequency and daysOfWeek)
          const dayOfWeek = now.getDay();
          const isScheduledToday = habit.frequency === 'DAILY' || 
                                  (habit.frequency === 'WEEKLY' && habit.daysOfWeek?.includes(dayOfWeek));

          if (isScheduledToday) {
            new Notification('Habit Reminder: ' + habit.title, {
              body: habit.description || 'Time to get started with your routine!',
              icon: '/favicon.ico', // Replace with a proper icon if available
            });
          }
        }
      });
    };

    const interval = setInterval(checkHabits, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [habits, notificationsEnabled]);

  return { notificationsEnabled, toggleNotifications };
}
