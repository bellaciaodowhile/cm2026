/**
 * Capitaliza la primera letra de cada palabra y limpia espacios múltiples.
 * @param {string} str
 * @returns {string}
 */
export function formatText(str) {
  if (!str || typeof str !== 'string') return str
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}

/**
 * Aplica formatText a todos los campos de texto de un objeto,
 * dejando intactos los campos que no son strings o están en la lista de exclusión.
 * @param {object} data
 * @param {string[]} exclude - campos a no formatear (ej: selects con valores fijos)
 * @returns {object}
 */
export function sanitizeRecord(data, exclude = []) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (exclude.includes(key) || typeof value !== 'string') return [key, value]
      return [key, formatText(value)]
    })
  )
}
