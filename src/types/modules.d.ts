// Type declarations for modules without TypeScript support

declare module 'jalaali-js' {
  export function toJalaali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number };
  export function toJalaali(date: Date): { jy: number; jm: number; jd: number };
  export function toGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number };
  export function isValidJalaaliDate(jy: number, jm: number, jd: number): boolean;
  export function isLeapJalaaliYear(jy: number): boolean;
  export function jalaaliMonthLength(jy: number, jm: number): number;
}

declare module 'moment-jalaali' {
  import { Moment } from 'moment';

  interface MomentJalaali extends Moment {
    jYear(): number;
    jMonth(): number;
    jDate(): number;
    jDayOfYear(): number;
    jWeek(): number;
    jWeekYear(): number;
    jYear(y: number): MomentJalaali;
    jMonth(m: number): MomentJalaali;
    jDate(d: number): MomentJalaali;
    format(format?: string): string;
  }

  function momentJalaali(inp?: string | number | Date | number[] | MomentJalaali | null, format?: string | string[], strict?: boolean): MomentJalaali;

  namespace momentJalaali {
    function loadPersian(options?: { usePersianDigits?: boolean; dialect?: string }): void;
  }

  export = momentJalaali;
}
