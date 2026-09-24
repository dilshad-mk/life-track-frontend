// ==========================================
// Indian Standard Time (IST) & Date Utilities
// Prevents any UTC date shift bugs
// ==========================================

// Today's baseline date in IST
export const getTodayIST = (): string => {
  const now = new Date();
  // Adjust to Indian Standard Time (UTC+5:30)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 3600000 * 5.5);
  
  // Format as YYYY-MM-DD
  const year = ist.getFullYear();
  const month = String(ist.getMonth() + 1).padStart(2, '0');
  const day = String(ist.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format Date object to YYYY-MM-DD strictly without timezone shift
export const formatLocalDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Parse YYYY-MM-DD to local Date object (setting hours to 12:00 to avoid any boundary shifts)
export const parseISODate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

export const TODAY_IST = getTodayIST();

// Format friendly date: "Wed, 23 Sep 2026"
export const formatFriendlyDate = (dateStr: string): string => {
  try {
    const date = parseISODate(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// Format time from 24-hour HH:mm to 12-hour hh:mm AM/PM
export const formatTime12Hour = (timeStr?: string): string => {
  if (!timeStr) return '';
  // Check if already in AM/PM format
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
    return timeStr;
  }

  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].slice(0, 2);
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12

  return `${hours}:${minutes} ${ampm}`;
};

// Calculate real consecutive daily streaks from tasks
export const calculateStreaks = (tasks: { date: string; completed?: boolean }[]): { currentStreak: number; longestStreak: number } => {
  const completedDates = new Set(tasks.filter((t) => t.completed).map((t) => t.date));
  if (completedDates.size === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = getTodayIST();
  let currentStreak = 0;
  let checkDate = parseISODate(today);

  // If today has completed tasks, start counting back from today
  if (completedDates.has(today)) {
    while (completedDates.has(formatLocalDateToISO(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    // If today has no completed tasks yet, check from yesterday so user has till tonight to maintain streak
    checkDate.setDate(checkDate.getDate() - 1);
    while (completedDates.has(formatLocalDateToISO(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Calculate longest streak across history
  const sortedDates = Array.from(completedDates).sort();
  let longestStreak = 0;
  let currentRun = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedDates) {
    const d = parseISODate(dStr);
    if (!prevDate) {
      currentRun = 1;
    } else {
      const diffMs = d.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun++;
      } else {
        currentRun = 1;
      }
    }
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
    prevDate = d;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
  };
};

