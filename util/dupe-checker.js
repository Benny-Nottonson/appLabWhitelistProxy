class DupeChecker {
  constructor() {
    this.duplicates = new Set();
    this.timeout = 10000;
  }

  check(req) {
    const key = req.path;
    if (this.duplicates.has(key)) {
      return false;
    } else {
      this.duplicates.add(key);
      setTimeout(() => {
        this.duplicates.delete(key);
      }, this.timeout);
      return true;
    }
  }
}

module.exports = DupeChecker;