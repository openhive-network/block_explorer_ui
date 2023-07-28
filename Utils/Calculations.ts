/**
 * Utils for calculating precisioned values of numbers.
 * @export
 * @param {number} amount raw integer amount as string
 * @param {number} precision as number (most of the time 3)
 * @returns {string} formatted precisioned number
 */
export function getAndFormatPrecision(amount: string, precision: number): string{
  return (Number(amount) / Math.pow(10, precision)).toFixed(precision);
}