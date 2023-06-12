interface ToastObj {
    type: string,
    content: string
}

export const useToast = () => useState(() => ref([] as Array<ToastObj>))
export function addToast(content:string, type: string = 'success') {
    const data = useToast()
    data.value.push({content, type})
    setTimeout(() => {
        data.value.shift()
    }, type === 'error' ? 30000 : 3000);
}