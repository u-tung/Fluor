export {}

declare global {
    interface Window {
        pywebview: {
            api: any,
        }
        jsApi: any
    }
}
