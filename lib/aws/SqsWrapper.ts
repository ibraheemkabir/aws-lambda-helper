import {AwsConfig} from '../LambdaConfig';
import {SQS} from 'aws-sdk';
import { ReceiveMessageRequest, SendMessageRequest, DeleteMessageRequest } from 'aws-sdk/clients/sqs';

export interface ListenerCancellation {
    cancelled: boolean;
}

export interface SqsMessageWrapper<T> {
    version: string;
    messageId: string;
    data: T;
}

export class SqsWrapper<T> {
    private readonly sqs: SQS;
    private _onMessage : ((v: T) => Promise<void>) | undefined = undefined;
    constructor(private conf: AwsConfig, private sync: boolean, private version: string, private messageId: string) {
        this.sqs = new SQS({ endpoint: conf.endpoint });
    }

    async listenForever(cancellationToken: ListenerCancellation): Promise<void> {
        while (cancellationToken.cancelled) {
            const res = await this.sqs.receiveMessage({
                QueueUrl: this.conf.sqsQueue,
                WaitTimeSeconds: 10,
            } as ReceiveMessageRequest).promise();
            if (this.sync) {
                for (let msg of res.Messages || []) {
                    try {
                        await this._onMessage!((JSON.parse(msg.Body!) as SqsMessageWrapper<T>).data);
                        this.sqs.deleteMessage({
                            QueueUrl: this.conf.sqsQueue,
                            ReceiptHandle: msg.ReceiptHandle,
                        } as DeleteMessageRequest);
                    } catch (e) {
                        console.error('Error processing SQS message', e);
                    }
                }
            } else {
                const results = (res.Messages || []).map(msg => this._onMessage!(JSON.parse(msg.Body!) as T));
                await Promise.all(results);
            }
        }
    }

    async send(data: T): Promise<void> {
        const wrappedMessage = {
            data: data,
            messageId: this.messageId,
            version: this.version,
        } as SqsMessageWrapper<T>;
        this.sqs.sendMessage({
            QueueUrl: this.conf.sqsQueue,
            MessageBody: JSON.stringify(wrappedMessage),
        } as SendMessageRequest);
    }

    listen(fun: (v: T) => Promise<void>) {
        this._onMessage = fun;
    }
}