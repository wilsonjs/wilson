module.exports = (...args) =>
  new Promise((resolve, reject) => {
    import('../dist/ts-plugin.js')
      .then((m) => resolve(m.default(...args)))
      .catch(reject)
  })
