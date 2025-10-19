// date.utils.ts
export function formatDateForInput(dateString: string | undefined): string | undefined {
    if (!dateString) return undefined;
    // This is a simple but effective conversion for ISO strings
    return dateString.split('T')[0]; 
}