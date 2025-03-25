import { format } from 'date-fns';

export const getToday = () => {
  const currentDate = new Date();
  return format(currentDate, 'yyyy-MM-dd');
};
