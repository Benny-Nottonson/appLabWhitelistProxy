import { Request } from 'express';

class DupeChecker {
  private readonly duplicates: { [key: string]: number } = {};
  private readonly timeout: number;

  constructor(timeout = 10000) {
    this.timeout = timeout;
  }

  check(req: Request): boolean {
    const key = req.path;
    const now = Date.now();

    if (this.duplicates[key] !== undefined && this.duplicates[key] + this.timeout > now) {
      return false;
    }

    this.duplicates[key] = now;
    return true;
  }
}

export default DupeChecker;