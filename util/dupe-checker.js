class DupeChecker {
    duplicates = new Set();
    timeout;
    constructor(timeout = 10000) {
        this.timeout = timeout;
    }
    check(req) {
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
