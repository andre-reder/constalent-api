import { getDay, subHours } from 'date-fns';

type WeekDaysType = 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab';

export default function getTodayWeekday(): WeekDaysType {
  const today = subHours(new Date(), 3);
  const todayWeekdayIndex = getDay(today);

  const weekDayLiterals = {
    0: 'dom',
    1: 'seg',
    2: 'ter',
    3: 'qua',
    4: 'qui',
    5: 'sex',
    6: 'sab',
  };

  return weekDayLiterals[todayWeekdayIndex] as WeekDaysType;
}
