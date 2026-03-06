const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const datetimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatDate(date) {
  if (!date) {
    return 'Not set';
  }

  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

export function formatTime(time) {
  if (!time) {
    return '--:--';
  }

  return time.slice(0, 5);
}

export function formatDateTime(date, time) {
  if (!date || !time) {
    return 'Schedule unavailable';
  }

  return datetimeFormatter.format(new Date(`${date}T${time}`));
}

export function formatStatus(status) {
  if (!status) {
    return 'Unknown';
  }

  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function getStatusTone(status) {
  return status?.toLowerCase() ?? 'default';
}

export function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function isPastAppointment(appointment) {
  if (!appointment?.date || !appointment?.time) {
    return false;
  }

  return new Date(`${appointment.date}T${appointment.time}`) < new Date();
}

export function sortAppointments(appointments) {
  return [...appointments].sort((left, right) =>
    `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`),
  );
}
