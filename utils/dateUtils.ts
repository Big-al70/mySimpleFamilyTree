
import { type Person } from '../types';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const FULL_MONTHS: { [key: string]: number } = {
    'JANUARY': 0, 'FEBRUARY': 1, 'MARCH': 2, 'APRIL': 3, 'MAY': 4, 'JUNE': 5,
    'JULY': 6, 'AUGUST': 7, 'SEPTEMBER': 8, 'OCTOBER': 9, 'NOVEMBER': 10, 'DECEMBER': 11
};

export const parseDateString = (dateStr: string | undefined): { day: number; month: number; year: number } | null => {
    if (!dateStr?.trim()) return null;

    // Normalize: uppercase, remove commas, ordinals, and common prefixes.
    let normalizedStr = dateStr
        .trim()
        .toUpperCase()
        .replace(/,/g, '')
        .replace(/(\d+)(ST|ND|RD|TH)/g, '$1')
        .replace(/^(?:ABOUT|ABT\.?|CIRCA|CIR\.?|C\.?|CA\.?)\s+/, '');

    let match;

    // Pattern: 5 JUNE 1990 or 5 JUN 1990
    match = normalizedStr.match(/^(\d{1,2})\s+([A-Z]{3,})\s+(\d{4})$/);
    if (match) {
        const day = parseInt(match[1], 10);
        const monthStr = match[2];
        const year = parseInt(match[3], 10);
        let month = FULL_MONTHS[monthStr] ?? MONTHS.indexOf(monthStr.substring(0, 3));
        if (month > -1) return { day, month, year };
    }

    // Pattern: JUNE 5 1990 or JUN 5 1990
    match = normalizedStr.match(/^([A-Z]{3,})\s+(\d{1,2})\s+(\d{4})$/);
    if (match) {
        const monthStr = match[1];
        const day = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        let month = FULL_MONTHS[monthStr] ?? MONTHS.indexOf(monthStr.substring(0, 3));
        if (month > -1) return { day, month, year };
    }
    
    // Pattern: MM/DD/YYYY or MM-DD-YYYY
    match = normalizedStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
        const month = parseInt(match[1], 10) - 1; // month is 0-indexed
        const day = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        if (month >= 0 && month < 12) return { day, month, year };
    }

    // Pattern: YYYY-MM-DD
    match = normalizedStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // month is 0-indexed
        const day = parseInt(match[3], 10);
        if (month >= 0 && month < 12) return { day, month, year };
    }
    
    // Pattern: JUNE 1990 or JUN 1990
    match = normalizedStr.match(/^([A-Z]{3,})\s+(\d{4})$/);
    if (match) {
        const monthStr = match[1];
        const year = parseInt(match[2], 10);
        let month = FULL_MONTHS[monthStr] ?? MONTHS.indexOf(monthStr.substring(0, 3));
        if (month > -1) return { day: 1, month, year };
    }

    // Pattern: YYYY only
    match = normalizedStr.match(/^(\d{4})$/);
    if (match) {
        const year = parseInt(match[1], 10);
        return { day: 1, month: 0, year };
    }

    // Fallback: extract first 4-digit number from a string.
    match = normalizedStr.match(/\b(\d{4})\b/);
    if (match) {
        const year = parseInt(match[1], 10);
        return { day: 1, month: 0, year };
    }

    return null;
};

export const sortByBirthDate = (a: Person, b: Person): number => {
    const dateA = parseDateString(a.birthDate);
    const dateB = parseDateString(b.birthDate);

    if (dateA && !dateB) return -1;
    if (!dateA && dateB) return 1;
    if (!dateA || !dateB) return 0;

    if (dateA.year !== dateB.year) {
        return dateA.year - dateB.year;
    }
    if (dateA.month !== dateB.month) {
        return dateA.month - dateB.month;
    }
    return dateA.day - dateB.day;
};

export const formatDateObject = (date: { day: number; month: number; year: number }): string => {
    return `${String(date.day).padStart(2, '0')} ${MONTHS[date.month]} ${date.year}`;
};


export const calculateAge = (birthDateStr?: string, deathDateStr?: string): number | null => {
    const birthDate = parseDateString(birthDateStr);
    
    if (!birthDate) {
        return null;
    }

    const isDeceased = deathDateStr !== undefined && deathDateStr !== '';

    if (isDeceased) {
        const deathDate = parseDateString(deathDateStr);
        if (deathDate) {
            let age = deathDate.year - birthDate.year;
            if (deathDate.month < birthDate.month || (deathDate.month === birthDate.month && deathDate.day < birthDate.day)) {
                age--;
            }
            return Math.max(0, age);
        }
        return null;
    } else {
        const today = new Date();
        const todayParsed = {
            day: today.getDate(),
            month: today.getMonth(),
            year: today.getFullYear()
        };

        let age = todayParsed.year - birthDate.year;
        if (todayParsed.month < birthDate.month || (todayParsed.month === birthDate.month && todayParsed.day < birthDate.day)) {
            age--;
        }
        return Math.max(0, age);
    }
};
