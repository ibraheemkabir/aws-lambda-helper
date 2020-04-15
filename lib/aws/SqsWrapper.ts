import {AwsConfig} from '../LambdaConfig';
import {SQS} from 'aws-sdk';
import { ReceiveMessageRequest, SendMessageRequest, DeleteMessageRequest } from 'aws-sdk/clients/sqs';
import {LoggerFactory, Logger, RetryConfig} from 'ferrum-plumbing';
import {LongRunningScheduler, LongRunningSchedulerOptions} from "ferrum-plumbing/dist/scheduler/LongRunningScheduler";

export interface SqsMessageWrapper<T> {
    version: string;
    messageId: string;
    data: T;
}

export class SqsWrapper<T> {
    private _onMessage : ((v: T) => Promise<void>) | undefined = undefined;
    private log: Logger;
    private id: string = (1000000 +Math.random() * 999999).toString();
    constructor(private conf: AwsConfig,
                loggerFactory: LoggerFactory,
                private sqs: SQS,
                private sync: boolean,
                private version: string,
                private messageId: string) {
        this.log = loggerFactory.getLogger('SqsWrapper');
    }

    async startPeriodicalFetch(scheduler: LongRunningScheduler): Promise<void> {
        const options = {
            repeatPeriod: 11000,
            logErrors: true,
            retry: { count: 0 } as RetryConfig,
        } as LongRunningSchedulerOptions;
        scheduler.schedulePeriodic(SqsWrapper.name, this._fetch, options);
    }

    private async _fetch() {
        const res = await this.sqs.receiveMessage({
            QueueUrl: this.conf.sqsQueue,
            WaitTimeSeconds: 10,
            VisibilityTimeout: 30,
        } as ReceiveMessageRequest).promise();
        if (this.sync) {
            for (let msg of res.Messages || []) {
                try {
                    let jsonMsg: SqsMessageWrapper<T>|undefined = undefined;
                    try {
                        jsonMsg = JSON.parse(msg.Body!) as SqsMessageWrapper<T>;
                    } catch (e) {
                        this.log.error('listenForever: Error parsing message. Ignoring: ', msg);
                    }
                    if (jsonMsg && jsonMsg.version == this.version && jsonMsg.messageId === this.messageId) {
                        await this._onMessage!((JSON.parse(msg.Body!) ).data);
                    } else if (!!jsonMsg) {
                        this.log.error(
                          `Received and invalid message; ignoring. Expected: ${this.messageId}@${this.version}` +
                          ` but received: ${jsonMsg!.messageId}@${jsonMsg.version}: `, msg
                        );
                    }

                    await this.sqs.deleteMessage({
                        QueueUrl: this.conf.sqsQueue,
                        ReceiptHandle: msg.ReceiptHandle,
                    } as DeleteMessageRequest).promise();
                } catch (e) {
                    console.error('Error processing SQS message', e);
                }
            }
        } else {
            const results = (res.Messages || []).map(msg => this._onMessage!(JSON.parse(msg.Body!) as T));
            await Promise.all(results);
        }
    }

    async send(data: T): Promise<void> {
        const wrappedMessage = {
            data: data,
            messageId: this.messageId,
            version: this.version,
        } as SqsMessageWrapper<T>;
        await this.sqs.sendMessage({
            QueueUrl: this.conf.sqsQueue,
            MessageBody: JSON.stringify(wrappedMessage),
        } as SendMessageRequest).promise();
    }

    listen(fun: (v: T) => Promise<void>) {
        this._onMessage = fun;
    }
}