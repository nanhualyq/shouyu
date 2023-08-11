export const useErrorDialog = (error: any) => {
    const message = error?.value?.data?.message || error?._data?.message
    // TODO: other <dialog> change to ElementPlus's Modal
    if (1) {
        ElNotification({
            title: '错误',
            message,
            type: 'error',
            duration: 10 * 1000
        })
    } else {
        ElMessageBox.alert(message, 'Error', {
            confirmButtonText: 'OK',
            type: 'error',
            center: true,
            appendTo: 'body'
        })
    }
}