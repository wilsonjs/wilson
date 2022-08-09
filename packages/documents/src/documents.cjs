module.exports = (...args) =>
  new Promise((resolve, reject) => {
    import('../dist/documents.js')
      .then((m) => resolve(m.default(...args)))
      .catch(reject)
  })
