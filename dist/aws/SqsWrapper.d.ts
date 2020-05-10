import { AwsConfig } from '../LambdaConfig';
import { SQS } from 'aws-sdk';
import { LoggerFactory } from 'ferrum-plumbing';
import { LongRunningScheduler } from "ferrum-plumbing/dist/scheduler/LongRunningScheduler";
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
    private id;
    constructor(conf: AwsConfig, loggerFactory: LoggerFactory, sqs: SQS, sync: boolean, version: string, messageId: string);
    startPeriodicalFetch(scheduler: LongRunningScheduler): Promise<void>;
    private onMessageWithTimeout;
    private _fetch;
    private deleteMessage;
    send(data: T): Promise<void>;
    listen(fun: (v: T) => Promise<void>): void;
}
//# sourceMappingURL=SqsWrapper.d.ts.map