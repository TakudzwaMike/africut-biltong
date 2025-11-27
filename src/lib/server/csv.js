/**
 * Escapes a field for CSV format.
 * Wraps in quotes if it contains commas, newlines, or quotes.
 * Escapes existing quotes with double quotes.
 */
export function escapeCsvField(field) {
    if (field === null || field === undefined) {
        return '';
    }
    const stringValue = String(field);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

/**
 * Simple CSV Parser.
 * Handles quoted fields and newlines correctly.
 * @param {string} csvText 
 * @returns {string[][]} Array of rows, where each row is an array of fields
 */
export function parseCsv(csvText) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let insideQuotes = false;
    
    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                // Escaped quote ("") inside a quoted field
                currentField += '"';
                i++; // Skip the next quote
            } else {
                // Toggle quote state
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            // End of field
            currentRow.push(currentField);
            currentField = '';
        } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !insideQuotes) {
            // End of row
            currentRow.push(currentField);
            rows.push(currentRow);
            currentRow = [];
            currentField = '';
            if (char === '\r') i++; // Handle CRLF
        } else {
            currentField += char;
        }
    }

    // Push the last field/row if exists
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }

    return rows;
}
