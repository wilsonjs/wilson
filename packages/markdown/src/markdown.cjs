module.exports = (...args) =>
  new Promise((resolve, reject) => {
    import('../dist/markdown.js')
      .then((m) => resolve(m.default(...args)))
      .catch(reject)
  })
