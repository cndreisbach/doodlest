const isMac = process.platform === 'darwin'
const isDevelopment = process.env.NODE_ENV !== 'production'

module.exports = {
  isMac, isDevelopment
}
