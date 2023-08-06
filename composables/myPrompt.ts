export default function myPrompt(tip: string, value: string) {
    const options = useState('the-prompt-options') as any
    options.value.open = true
    options.value.tip = tip
    options.value.value = value

    return new Promise((resolve, reject) => {
        const unwatch = watch(options, (val, newVal) => {
            if (!newVal?.open) {
                resolve(newVal?.value)
                unwatch()
            }
        }, {deep: true})
    })
}