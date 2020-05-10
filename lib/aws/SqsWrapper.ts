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

const MESSAGE_PROCESS_TIMEOUT = 400;

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
        this._fetch = this._fetch.bind(this);
        this.startPeriodicalFetch = this.startPeriodicalFetch.bind(this);
    }

    async startPeriodicalFetch(scheduler: LongRunningScheduler): Promise<void> {
        const options = {
            repeatPeriod: 11000,
            logErrors: true,
            retry: { count: 0 } as RetryConfig,
        } as LongRunningSchedulerOptions;
        scheduler.schedulePeriodic(SqsWrapper.name, this._fetch, options);
    }

    private onMessageWithTimeout(data: any): Promise<void> {
        if (!this._onMessage) {
            this.log.error('Calling onMessageWithTimeout, but _onMessage is not set');
            return Promise.resolve();
        }
        const dis = this;
        return new Promise(async (resolve, reject) => {
            const tOut = setTimeout(() => {
                dis.log.error('onMessageWithTimeout: Timed out processing message ', data);
                reject(new Error('Timed out processing message'));
            }, MESSAGE_PROCESS_TIMEOUT);
            try {
                const res = await dis._onMessage!(data);
                resolve(res);
            } catch (e) {
                reject(e)
            } finally {
                clearTimeout(tOut);
            }
        });
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
                        await this.deleteMessage(msg);
                    }
                    if (jsonMsg && jsonMsg.version == this.version && jsonMsg.messageId === this.messageId) {
                        try {
                            await this.onMessageWithTimeout((JSON.parse(msg.Body!) ).data);
                            await this.deleteMessage(msg);
                        } catch (e) {
                            this.log.error('listenForever: Error processing message. Keeping it in the queue', e);
                            throw e;
                        }
                    } else if (!!jsonMsg) {
                        this.log.error(
                            `Received and invalid message; ignoring. Expected: ${this.messageId}@${this.version}` +
                            ` but received: ${jsonMsg!.messageId}@${jsonMsg.version}: `, msg
                        );
                        await this.deleteMessage(msg);
                    }
                } catch (e) {
                    console.error('Error processing SQS message', e);
                    throw e;
                }
            }
        } else {
            // TODO: This is broken
            throw new Error('Parallel SQS wrapper not implemented properly');
            const results = (res.Messages || []).map(msg => this._onMessage!(JSON.parse(msg.Body!) as T));
            await Promise.all(results);
        }
    }

    private async deleteMessage(msg: SQS.Message) {
        return this.sqs.deleteMessage({
            QueueUrl: this.conf.sqsQueue,
            ReceiptHandle: msg.ReceiptHandle,
        } as DeleteMessageRequest).promise();
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
