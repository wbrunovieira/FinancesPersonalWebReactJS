export const formatDateTime = (value: string): string => {
    const cleaned = value.replace(/\D+/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})(\d{0,2})(\d{0,2})$/);
  
    if (!match) return value;
  
    const [, day, month, year, hours, minutes] = match;
  
    let formatted = '';
    if (day) formatted += day;
    if (month) formatted += '/' + month;
    if (year) formatted += '/' + year;
    if (hours) formatted += ' ' + hours;
    if (minutes) formatted += ':' + minutes;
  
    return formatted.trim();
  };
  
  export const isValidDateTime = (value: string): boolean => {
    const [datePart, timePart] = value.split(' ');
  
    if (!datePart || !timePart) return false;
  
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
  
    const date = new Date(year, month - 1, day, hours, minutes);
  
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      date.getHours() === hours &&
      date.getMinutes() === minutes
    );
  };