import configuration from '../config/configuration';
import Decimal from 'decimal.js';

// Change source path according to environment
const determineSourcePath = (): string => {
  const environment = configuration().node_env;

  // Only during production we load from dist, else development or test will always use src
  return environment === 'production' || environment === 'uat'
    ? 'dist/'
    : 'src/';
};

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
const convertToSnakeCase = (name: string): string => {
  const splitedStrings = name.split(' ');

  return splitedStrings.join('_').toLowerCase();
};

const formatTimeLeft = (dueDate: Date): string => {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Overdue';
  }

  const MS_IN_MINUTE = 60 * 1000;
  const MS_IN_HOUR = 60 * MS_IN_MINUTE;
  const MS_IN_DAY = 24 * MS_IN_HOUR;

  const days = Math.floor(diffMs / MS_IN_DAY);
  const remainingMsAfterDays = diffMs % MS_IN_DAY;
  const hours = Math.floor(remainingMsAfterDays / MS_IN_HOUR);

  if (days > 0) {
    const dayString = days === 1 ? 'day' : 'days';
    const hourString = hours === 1 ? 'hour' : 'hours';

    const hourPart = hours > 0 ? ` ${hours} ${hourString}` : '';
    return `${days} ${dayString}${hourPart} left`;
  }

  const totalHours = Math.floor(diffMs / MS_IN_HOUR);
  if (totalHours > 0) {
    const hourString = totalHours === 1 ? 'hour' : 'hours';
    return `${totalHours} ${hourString} left`;
  }

  const totalMinutes = Math.floor(diffMs / MS_IN_MINUTE);
  if (totalMinutes > 0) {
    const minuteString = totalMinutes === 1 ? 'minute' : 'minutes';
    return `${totalMinutes} ${minuteString} left`;
  }

  return 'Less than a minute left';
};
export {
  formatTimeLeft,
  formatDate,
  formatTimestamp,
  determineSourcePath,
  convertToSnakeCase,
};
