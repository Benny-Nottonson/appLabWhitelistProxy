import { Request } from 'express';

class DupeChecker {
  private duplicates: Set<string>;
  private timeout: number;

  constructor() {
    this.duplicates = new Set();
    this.timeout = 10000;
  }

  check(req: Request): boolean {
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

export default DupeChecker;