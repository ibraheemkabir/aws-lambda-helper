import { AwsConfig } from '../LambdaConfig';
export interface ListenerCancellation {
    cancelled: boolean;
}
export declare class SqsWrapper<T> {
    private conf;
    private sync;
    private readonly sqs;
    private _onMessage;
    constructor(conf: AwsConfig, sync: boolean);
    listenForever(cancellationToken: ListenerCancellation): Promise<void>;
    listen(fun: (v: T) => Promise<void>): void;
}
//# sourceMappingURL=SqsWrapper.d.ts.map