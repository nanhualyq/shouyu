export default function browser_assert(condition: Boolean, msg: string) {
    if (!condition) {
        showError(`[Assert fail] ${msg}`)
        // throw new Error(`[Assert fail] ${msg}`)
    }
}