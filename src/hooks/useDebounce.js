import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any value (e.g., search text).
 * Delays updating the debounced value until after the user has stopped typing.
 */
export default function useDebounce(value, delay = 450) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set a timer to update debounced value after the specified delay
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cancel previous timer if value changes before delay has elapsed
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
