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
const aws_sdk_1 = require("aws-sdk");
class SqsWrapper {
    constructor(conf, sync) {
        this.conf = conf;
        this.sync = sync;
        this._onMessage = undefined;
        this.sqs = new aws_sdk_1.SQS({ endpoint: conf.endpoint });
    }
    listenForever(cancellationToken) {
        return __awaiter(this, void 0, void 0, function* () {
            while (cancellationToken.cancelled) {
                const res = yield this.sqs.receiveMessage({
                    QueueUrl: this.conf.sqsQueue,
                    WaitTimeSeconds: 10,
                }).promise();
                if (this.sync) {
                    for (let msg of res.Messages || []) {
                        yield this._onMessage(JSON.parse(msg.Body));
                    }
                }
                else {
                    const results = (res.Messages || []).map(msg => this._onMessage(JSON.parse(msg.Body)));
                    yield Promise.all(results);
                }
            }
        });
    }
    listen(fun) {
        this._onMessage = fun;
    }
}
exports.SqsWrapper = SqsWrapper;
//# sourceMappingURL=SqsWrapper.js.map