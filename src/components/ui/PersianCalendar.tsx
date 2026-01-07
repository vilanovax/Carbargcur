'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react'
import jalaali from 'jalaali-js'

interface PersianCalendarProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showTime?: boolean
  minDate?: string
  maxDate?: string
}

interface CalendarDay {
  day: number
  month: number
  year: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isDisabled: boolean
  gregorianDate: Date
}

const PersianCalendar: React.FC<PersianCalendarProps> = ({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  disabled = false,
  className = '',
  showTime = false,
  minDate,
  maxDate
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (value && value.trim()) {
      const date = new Date(value)
      return !isNaN(date.getTime()) ? date : null
    }
    return null
  })
  const [selectedTime, setSelectedTime] = useState<string>('00:00')
  const calendarRef = useRef<HTMLDivElement>(null)

  // تنظیم currentDate بعد از mount کردن کامپوننت
  useEffect(() => {
    if (!currentDate) {
      setCurrentDate(new Date())
    }
  }, [currentDate])

  // به‌روزرسانی selectedDate وقتی value تغییر می‌کند
  useEffect(() => {
    if (value && value.trim()) {
      const newSelectedDate = new Date(value)
      // چک کردن اینکه تاریخ معتبر است
      if (!isNaN(newSelectedDate.getTime())) {
        setSelectedDate(newSelectedDate)
        // اگر تقویم باز است، currentDate را هم به‌روزرسانی کن
        if (isOpen) {
          setCurrentDate(newSelectedDate)
        }
      }
    } else {
      setSelectedDate(null)
    }
  }, [value, isOpen])

  // نام‌های ماه‌های شمسی
  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد',
    'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر',
    'دی', 'بهمن', 'اسفند'
  ]

  // تعداد روزهای هر ماه شمسی
  const persianDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30]

  // نام‌های روزهای هفته
  const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

  // تبدیل تاریخ میلادی به شمسی
  const gregorianToPersian = (date: Date): { year: number; month: number; day: number } => {
    // چک کردن اینکه تاریخ معتبر است
    if (!date || isNaN(date.getTime())) {
      const today = new Date()
      const { jy, jm, jd } = jalaali.toJalaali(today)
      return { year: jy, month: jm, day: jd }
    }
    
    try {
      const { jy, jm, jd } = jalaali.toJalaali(date)
      return { year: jy, month: jm, day: jd }
    } catch (error) {
      console.error('Error converting Gregorian to Persian:', error)
      const today = new Date()
      const { jy, jm, jd } = jalaali.toJalaali(today)
      return { year: jy, month: jm, day: jd }
    }
  }

  // تبدیل تاریخ شمسی به میلادی
  const persianToGregorian = (year: number, month: number, day: number): Date => {
    try {
      const { gy, gm, gd } = jalaali.toGregorian(year, month, day)
      // استفاده از noon time برای جلوگیری از مشکلات timezone
      return new Date(gy, gm - 1, gd, 12, 0, 0, 0)
    } catch (error) {
      console.error('Error in persianToGregorian:', error)
      return new Date()
    }
  }

  // تولید روزهای تقویم
  const generateCalendarDays = (): CalendarDay[] => {
    const persianDate = gregorianToPersian(currentDate || new Date())
    const firstDayOfMonth = persianToGregorian(persianDate.year, persianDate.month, 1)
    // اصلاح شروع هفته: شنبه اولین ستون
    const jsDay = firstDayOfMonth.getDay();
    const persianWeekDay = (jsDay + 1) % 7;
    const startDate = new Date(firstDayOfMonth)
    startDate.setDate(startDate.getDate() - persianWeekDay)
    
    const days: CalendarDay[] = []
    const today = new Date()
    const todayPersian = gregorianToPersian(today)
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i)
      
      const persian = gregorianToPersian(date)
      const isCurrentMonth = persian.month === persianDate.month && persian.year === persianDate.year
      const isToday = persian.day === todayPersian.day && persian.month === todayPersian.month && persian.year === todayPersian.year
      const isSelected = selectedDate ? date.toDateString() === selectedDate.toDateString() : false
      
      // بررسی محدودیت‌های تاریخ
      let isDisabled = false
      if (minDate && date < new Date(minDate)) isDisabled = true
      if (maxDate && date > new Date(maxDate)) isDisabled = true
      
      days.push({
        day: persian.day,
        month: persian.month,
        year: persian.year,
        isCurrentMonth,
        isToday,
        isSelected,
        isDisabled,
        gregorianDate: date
      })
    }
    
    return days
  }

  // انتخاب تاریخ
  const handleDateSelect = (day: CalendarDay) => {
    if (day.isDisabled) return
    
    setSelectedDate(day.gregorianDate)
    
    if (!showTime) {
      // استفاده از local timezone به جای UTC
      const year = day.gregorianDate.getFullYear()
      const month = String(day.gregorianDate.getMonth() + 1).padStart(2, '0')
      const dayStr = String(day.gregorianDate.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${dayStr}`
      
      onChange?.(dateString)
      setIsOpen(false)
    }
  }

  // تایید انتخاب با زمان
  const handleConfirmWithTime = () => {
    if (selectedDate) {
      const [hours, minutes] = selectedTime.split(':')
      const dateWithTime = new Date(selectedDate)
      dateWithTime.setHours(parseInt(hours), parseInt(minutes))
      
      const dateString = dateWithTime.toISOString()
      onChange?.(dateString)
      setIsOpen(false)
    }
  }

  // تغییر ماه
  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate || new Date())
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // تغییر سال
  const changeYear = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate || new Date())
    if (direction === 'prev') {
      newDate.setFullYear(newDate.getFullYear() - 1)
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1)
    }
    setCurrentDate(newDate)
  }

  // بستن تقویم با کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // نمایش تاریخ انتخاب شده
  const displayValue = () => {
    if (!selectedDate) return placeholder
    
    const persian = gregorianToPersian(selectedDate)
    const timeString = showTime ? ` ${selectedTime}` : ''
    return `${persian.year}/${persian.month.toString().padStart(2, '0')}/${persian.day.toString().padStart(2, '0')}${timeString}`
  }

  const persianDate = gregorianToPersian(currentDate || new Date())
  const calendarDays = generateCalendarDays()

  // جلوگیری از رندر تا currentDate تنظیم شود
  if (!currentDate) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800">
          <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={calendarRef}>
      {/* Input Field */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen)
            // اگر تقویم باز می‌شود و تاریخ انتخاب شده وجود دارد، روی آن فوکوس کن
            if (!isOpen && selectedDate) {
              setCurrentDate(selectedDate)
            }
          }
        }}
        className={`
          w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
          focus:ring-2 focus:ring-green-500 focus:border-transparent 
          dark:bg-gray-700 dark:text-white text-base cursor-pointer
          flex items-center justify-between
          ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'hover:border-gray-400'}
        `}
      >
        <span className={selectedDate ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {displayValue()}
        </span>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>

      {/* Calendar Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                انتخاب تاریخ
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Body */}
            <div className="p-4">
              {/* Month and Year Navigation */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeYear('prev')}
                    className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    &lt;&lt;
                  </button>
                  <button
                    type="button"
                    onClick={() => changeMonth('prev')}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {persianMonths[persianDate.month - 1]} {persianDate.year}
                </h4>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeMonth('next')}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => changeYear('next')}
                    className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    &gt;&gt;
                  </button>
                </div>
              </div>

              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className="h-8 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    disabled={day.isDisabled}
                    className={`
                      h-10 w-full rounded-lg text-sm font-medium transition-colors
                      ${day.isDisabled 
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                        : day.isSelected
                        ? 'bg-green-600 text-white'
                        : day.isToday
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : day.isCurrentMonth
                        ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {day.day}
                  </button>
                ))}
              </div>

              {/* Time Selection (if enabled) */}
              {showTime && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    انتخاب زمان
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              {/* Action Buttons - فقط برای showTime */}
              {showTime && (
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmWithTime}
                    disabled={!selectedDate}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                  >
                    تایید
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PersianCalendar 