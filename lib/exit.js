module.exports = function exit (message) {
  console.error('Error:', message)
  process.exit(1)
}
