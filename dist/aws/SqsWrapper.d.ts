import { AwsConfig } from '../LambdaConfig';
import { SQS } from 'aws-sdk';
import { LoggerFactory } from 'ferrum-plumbing';
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
    private sqs;
    private sync;
    private version;
    private messageId;
    private _onMessage;
    private log;
    constructor(conf: AwsConfig, loggerFactory: LoggerFactory, sqs: SQS, sync: boolean, version: string, messageId: string);
    listenForever(cancellationToken: ListenerCancellation): Promise<void>;
    send(data: T): Promise<void>;
    listen(fun: (v: T) => Promise<void>): void;
}
//# sourceMappingURL=SqsWrapper.d.ts.map