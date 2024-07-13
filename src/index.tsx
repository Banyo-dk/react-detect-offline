import { ReactElement, useEffect, useState } from "react"

interface PingConfig {
    /**
     * The url to poll
     */
    url: string

    /**
     * Timeout for the poll request itself.
     * If a response has not been received within this time,
       the request will be considered failed.
     */
    timeout: number
}

export interface PollingConfig extends PingConfig {
    /**
     * Polling enabled or not
     */
    enabled: boolean

    /**
     * Interval between each poll request
     */
    interval: number
}

type StatusFn<T> = ({ online }: { online: boolean }) => T

interface DetectorProps {
    config?: Partial<PollingConfig>
    onPoll?: StatusFn<void>
    render: ({ online }: { online: boolean }) => JSX.Element
}

const inBrowser = typeof navigator !== "undefined"
const unsupportedUserAgentsPattern = /Windows.*Chrome|Windows.*Firefox|Linux.*Chrome/

const ping = ({ url, timeout }: PingConfig): Promise<boolean> => {
    return new Promise((resolve) => {
        const isOnline = () => resolve(true)
        const isOffline = () => resolve(false)

        const xhr = new XMLHttpRequest()

        xhr.onerror = isOffline
        xhr.ontimeout = isOffline
        xhr.onreadystatechange = () => {
            if (xhr.readyState === xhr.HEADERS_RECEIVED) {
                xhr.status ? isOnline() : isOffline()
            }
        }

        xhr.open("GET", url)
        xhr.timeout = timeout

        xhr.send()
    })
}

const defaultPollingConfig: PollingConfig = {
    enabled: inBrowser && unsupportedUserAgentsPattern.test(navigator.userAgent),
    url: "https://httpbin.org/get",
    timeout: 5000,
    interval: 5000
}

const useNetworkStatus = (pollingConfig?: Partial<PollingConfig>, onPoll?: StatusFn<void>) => {
    const [online, setOnline] = useState<boolean>(
        inBrowser && typeof navigator.onLine === "boolean" ? navigator.onLine : true
    )

    useEffect(() => {
        const goOnline = () => setOnline(true)
        const goOffline = () => setOnline(false)

        window.addEventListener("online", goOnline)
        window.addEventListener("offline", goOffline)

        let pollingId: NodeJS.Timeout | null = null
        const config = { ...defaultPollingConfig, ...pollingConfig }

        if (config.enabled) {
            pollingId = setInterval(() => {
                ping({ url: config.url, timeout: config.timeout }).then((isOnline) => {
                    if (isOnline !== online) {
                        setOnline(isOnline)
                    }

                    if (onPoll) onPoll({ online: isOnline })
                })
            }, config.interval)
        }

        return () => {
            window.removeEventListener("online", goOnline)
            window.removeEventListener("offline", goOffline)

            if (pollingId) clearInterval(pollingId)
        }
    }, [online, pollingConfig, onPoll])

    return online
}

export const Detector = ({ config, onPoll, render }: DetectorProps): ReactElement => {
    const online = useNetworkStatus(config, onPoll)

    return <>{render({ online })}</>
}
