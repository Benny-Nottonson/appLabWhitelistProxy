import { Request } from 'express';

class DupeChecker {
  private duplicates: Set<string>;
  private timeout: number;

  constructor(timeout: number = 10000) {
    this.duplicates = new Set();
    this.timeout = timeout;
  }

  check(req: Request): boolean {
    const key = req.path;
    if (this.duplicates.has(key)) {
      return false;
    }

    this.duplicates.add(key);
    setTimeout(() => {
      this.duplicates.delete(key);
    }, this.timeout);

    return true;
  }
}

export default DupeChecker;