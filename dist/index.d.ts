import { ReactElement } from "react";
interface PingConfig {
    /**
     * The url to poll
     */
    url: string;
    /**
     * Timeout for the poll request itself.
     * If a response has not been received within this time,
       the request will be considered failed.
     */
    timeout: number;
}
export interface PollingConfig extends PingConfig {
    /**
     * Polling enabled or not
     */
    enabled: boolean;
    /**
     * Interval between each poll request
     */
    interval: number;
}
type StatusFn<T> = ({ online }: {
    online: boolean;
}) => T;
interface DetectorProps {
    config?: Partial<PollingConfig>;
    onPoll?: StatusFn<void>;
    render: ({ online }: {
        online: boolean;
    }) => JSX.Element;
}
export declare const Detector: ({ config, onPoll, render }: DetectorProps) => ReactElement;
export {};
