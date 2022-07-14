module.exports = (...args) =>
  new Promise((resolve, reject) => {
    import("../dist/utils.js")
      .then((m) => resolve(m.default(...args)))
      .catch(reject);
  });
