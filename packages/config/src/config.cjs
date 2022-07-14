module.exports = (...args) =>
  new Promise((resolve, reject) => {
    import("../dist/config.js")
      .then((m) => resolve(m.default(...args)))
      .catch(reject);
  });
