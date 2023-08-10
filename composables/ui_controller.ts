export const useErrorDialog = (error:any) => {
    const message = error?.value?.data?.message || error?._data?.message
    useState('TheErrorDialogMessage').value = message
    const dialog = document.getElementById('the_error_dialog') as HTMLDialogElement
    if (dialog.open) {
        ElNotification({
            title: '错误',
            message,
            type: 'error',
            duration: 10 * 1000
        })
    } else {
        dialog?.showModal()
    }
}