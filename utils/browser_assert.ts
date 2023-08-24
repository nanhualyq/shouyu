export default function (condition: Boolean, msg: string) {
    if (!condition) {
        showError(`[Assert fail] ${msg}`)
        // throw new Error(`[Assert fail] ${msg}`)
    }
}