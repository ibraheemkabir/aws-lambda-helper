import { AwsConfig } from '../LambdaConfig';
export interface ListenerCancellation {
    cancelled: boolean;
}
export interface SqsMessageWrapper<T> {
    version: string;
    messageId: string;
    data: T;
}
export declare class SqsWrapper<T> {
    private conf;
    private sync;
    private version;
    private messageId;
    private readonly sqs;
    private _onMessage;
    constructor(conf: AwsConfig, sync: boolean, version: string, messageId: string);
    listenForever(cancellationToken: ListenerCancellation): Promise<void>;
    send(data: T): Promise<void>;
    listen(fun: (v: T) => Promise<void>): void;
}
//# sourceMappingURL=SqsWrapper.d.ts.map