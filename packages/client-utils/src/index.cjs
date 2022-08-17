module.exports = (...args) =>
  new Promise((resolve, reject) => {
    import('../dist/index.js')
      .then((m) => resolve(m.default(...args)))
      .catch(reject)
  })
