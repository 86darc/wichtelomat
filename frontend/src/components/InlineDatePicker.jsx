import { useState, useEffect } from 'react'

const MONTHS_DE = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]
const DAYS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function toIsoDate(d, m, y) {
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function toDisplayStr(isoDate) {
    if (!isoDate) return ''
    const [y, m, d] = isoDate.split('-')
    return `${d}.${m}.${y}`
}

// Monday-based weekday index (0=Mon … 6=Sun)
function weekdayIndex(date) {
    const d = date.getDay()
    return d === 0 ? 6 : d - 1
}

function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate()
}

function InlineDatePicker({ value, onChange }) {
    const [inputStr, setInputStr] = useState(toDisplayStr(value))
    const [viewYear, setViewYear] = useState(() => value ? Number(value.split('-')[0]) : new Date().getFullYear())
    const [viewMonth, setViewMonth] = useState(() => value ? Number(value.split('-')[1]) - 1 : new Date().getMonth())

    useEffect(() => {
        setInputStr(toDisplayStr(value))
        if (value) {
            setViewYear(Number(value.split('-')[0]))
            setViewMonth(Number(value.split('-')[1]) - 1)
        }
    }, [value])

    function handleInputChange(e) {
        const str = e.target.value
        setInputStr(str)
        const match = str.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
        if (match) {
            const d = Number(match[1]), m = Number(match[2]), y = Number(match[3])
            const date = new Date(y, m - 1, d)
            if (!isNaN(date.getTime()) && date.getMonth() === m - 1 && date.getDate() === d) {
                setViewYear(y)
                setViewMonth(m - 1)
                onChange(toIsoDate(d, m, y))
            }
        }
    }

    function handleDayClick(day) {
        const m = viewMonth + 1
        setInputStr(`${String(day).padStart(2, '0')}.${String(m).padStart(2, '0')}.${viewYear}`)
        onChange(toIsoDate(day, m, viewYear))
    }

    function prevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
        else setViewMonth(m => m - 1)
    }

    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
        else setViewMonth(m => m + 1)
    }

    const totalDays = daysInMonth(viewYear, viewMonth)
    const firstOffset = weekdayIndex(new Date(viewYear, viewMonth, 1))

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const selectedIso = value || ''
    const [selY, selM, selD] = selectedIso ? selectedIso.split('-').map(Number) : []

    return (
        <div className="date-picker">
            <input
                type="text"
                className="date-picker-input"
                value={inputStr}
                onChange={handleInputChange}
                placeholder="TT.MM.JJJJ"
            />
            <div className="date-picker-calendar">
                <div className="date-picker-header">
                    <button type="button" className="date-picker-nav" onClick={prevMonth}>‹</button>
                    <span className="date-picker-month-label">
                        {MONTHS_DE[viewMonth]} {viewYear}
                    </span>
                    <button type="button" className="date-picker-nav" onClick={nextMonth}>›</button>
                </div>
                <div className="date-picker-grid">
                    {DAYS_DE.map(d => (
                        <span key={d} className="date-picker-weekday">{d}</span>
                    ))}
                    {Array.from({ length: firstOffset }).map((_, i) => (
                        <span key={`e${i}`} />
                    ))}
                    {Array.from({ length: totalDays }).map((_, i) => {
                        const day = i + 1
                        const date = new Date(viewYear, viewMonth, day)
                        date.setHours(0, 0, 0, 0)
                        const isSelected = selY === viewYear && selM === viewMonth + 1 && selD === day
                        const isToday = date.getTime() === today.getTime()
                        return (
                            <button
                                type="button"
                                key={day}
                                className={`date-picker-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                                onClick={() => handleDayClick(day)}
                            >
                                {day}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default InlineDatePicker
