export async function fetchWrapper(fetch:Promise<any>) {
    const loading = ElLoading.service({
        lock: true,
        // text: 'Loading',
        // background: 'rgba(0, 0, 0, 0.7)',
      })
    const res = await fetch
        .finally(() => loading.close())
    if (res?.error.value) {
        useErrorDialog(res?.error)
    }
    return res
}