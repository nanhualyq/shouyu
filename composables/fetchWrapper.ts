export async function fetchWrapper(fetch:Promise<any>) {
    const fullLoading = useState('fullLoading')
    fullLoading.value = true
    const res = await fetch
        .finally(() => fullLoading.value = false)
    if (res?.error.value) {
        useErrorDialog(res?.error)
    }
    return res
}