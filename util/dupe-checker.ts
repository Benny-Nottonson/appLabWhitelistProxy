import { Request } from 'express';

class DupeChecker {
  private readonly duplicates = new Set<string>();
  private readonly timeout: number;

  constructor(timeout = 10000) {
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