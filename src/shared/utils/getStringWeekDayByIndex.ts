type WeekDaysType = 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab';

export default function getStringWeekDayByIndex(weekDayIndex: number) {
  const weekDayLiterals = {
    0: 'dom',
    1: 'seg',
    2: 'ter',
    3: 'qua',
    4: 'qui',
    5: 'sex',
    6: 'sab',
  };

  return weekDayLiterals[weekDayIndex] as WeekDaysType;
}
