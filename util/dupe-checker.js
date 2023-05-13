class DupeChecker {
    duplicates = {};
    timeout;
    constructor(timeout = 10000) {
        this.timeout = timeout;
    }
    check(req) {
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
