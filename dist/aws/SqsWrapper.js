"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class SqsWrapper {
    constructor(conf, loggerFactory, sqs, sync, version, messageId) {
        this.conf = conf;
        this.sqs = sqs;
        this.sync = sync;
        this.version = version;
        this.messageId = messageId;
        this._onMessage = undefined;
        this.id = (1000000 + Math.random() * 999999).toString();
        this.log = loggerFactory.getLogger('SqsWrapper');
    }
    startPeriodicalFetch(scheduler) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                repeatPeriod: 11000,
                logErrors: true,
                retry: { count: 0 },
            };
            scheduler.schedulePeriodic(SqsWrapper.name, this._fetch, options);
        });
    }
    _fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.sqs.receiveMessage({
                QueueUrl: this.conf.sqsQueue,
                WaitTimeSeconds: 10,
                VisibilityTimeout: 30,
            }).promise();
            if (this.sync) {
                for (let msg of res.Messages || []) {
                    try {
                        let jsonMsg = undefined;
                        try {
                            jsonMsg = JSON.parse(msg.Body);
                        }
                        catch (e) {
                            this.log.error('listenForever: Error parsing message. Ignoring: ', msg);
                        }
                        if (jsonMsg && jsonMsg.version == this.version && jsonMsg.messageId === this.messageId) {
                            yield this._onMessage((JSON.parse(msg.Body)).data);
                        }
                        else if (!!jsonMsg) {
                            this.log.error(`Received and invalid message; ignoring. Expected: ${this.messageId}@${this.version}` +
                                ` but received: ${jsonMsg.messageId}@${jsonMsg.version}: `, msg);
                        }
                        yield this.sqs.deleteMessage({
                            QueueUrl: this.conf.sqsQueue,
                            ReceiptHandle: msg.ReceiptHandle,
                        }).promise();
                    }
                    catch (e) {
                        console.error('Error processing SQS message', e);
                    }
                }
            }
            else {
                const results = (res.Messages || []).map(msg => this._onMessage(JSON.parse(msg.Body)));
                yield Promise.all(results);
            }
        });
    }
    send(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const wrappedMessage = {
                data: data,
                messageId: this.messageId,
                version: this.version,
            };
            yield this.sqs.sendMessage({
                QueueUrl: this.conf.sqsQueue,
                MessageBody: JSON.stringify(wrappedMessage),
            }).promise();
        });
    }
    listen(fun) {
        this._onMessage = fun;
    }
}
exports.SqsWrapper = SqsWrapper;
//# sourceMappingURL=SqsWrapper.js.map