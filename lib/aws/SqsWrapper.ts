import {AwsConfig} from '../LambdaConfig';
import {SQS} from 'aws-sdk';
import { ReceiveMessageRequest } from 'aws-sdk/clients/sqs';

export interface ListenerCancellation {
    cancelled: boolean;
}

export class SqsWrapper<T> {
    private readonly sqs: SQS;
    private _onMessage : ((v: T) => Promise<void>) | undefined = undefined;
    constructor(private conf: AwsConfig, private sync: boolean) {
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
                    await this._onMessage!(JSON.parse(msg.Body!) as T);
                }
            } else {
                const results = (res.Messages || []).map(msg => this._onMessage!(JSON.parse(msg.Body!) as T));
                await Promise.all(results);
            }
        }
    }

    listen(fun: (v: T) => Promise<void>) {
        this._onMessage = fun;
    }
}