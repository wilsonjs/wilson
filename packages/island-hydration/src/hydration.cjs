module.exports = (...args) =>
  new Promise((resolve, reject) => {
    import('../dist/hydration.js')
      .then((m) => resolve(m.default(...args)))
      .catch(reject)
  })
