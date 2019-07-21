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
const LambdaGlobalContext_1 = require("./lib/LambdaGlobalContext");
const aws_sdk_1 = require("aws-sdk");
const LambdaConfig_1 = require("./lib/LambdaConfig");
// Once registered this is the handler code for lambda_template
function handler(event, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const container = yield LambdaGlobalContext_1.LambdaGlobalContext.container();
        yield container.registerModule(new MyLambdaModule()); // Change this to your defined module
        const lgc = container.get(LambdaGlobalContext_1.LambdaGlobalContext);
        return yield lgc.handleAsync(event, context);
    });
}
exports.handler = handler;
// Implement your specific handlers in a separate file
class EchoHttpHandler {
    handle(request, context) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                body: 'You did say ' + request.queryStringParameters['message'],
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'text/html',
                },
                statusCode: 200,
            };
        });
    }
}
exports.EchoHttpHandler = EchoHttpHandler;
// Implement your specific handlers in a separate file
class PingPongSqsHandler {
    constructor(lambdaConfig, sqs) {
        this.lambdaConfig = lambdaConfig;
        this.sqs = sqs;
    }
    handle(request, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const rec = request.Records[0];
            // @ts-ignore
            console.log('Received SQS message ', rec);
            const { message, count } = JSON.parse(rec.body);
            if (!message || !count) {
                // @ts-ignore
                console.error('PingPongSqsHandler.handle', request);
                throw new Error('No message found in the SQS request');
            }
            aws_sdk_1.config.update({ region: rec.awsRegion });
            yield this.sqs.sendMessage({
                DelaySeconds: 2,
                QueueUrl: this.lambdaConfig.sqsQueueUrl,
                MessageBody: JSON.stringify({ message: message === 'ping' ? 'pong' : 'ping', count: count + 1 }),
            }, (r) => r).promise();
        });
    }
    __name__() {
        return 'PingPongSqsHandler';
    }
}
exports.PingPongSqsHandler = PingPongSqsHandler;
class MyLambdaModule {
    configAsync(container) {
        return __awaiter(this, void 0, void 0, function* () {
            container.register('LambdaHttpHandler', () => new EchoHttpHandler());
            container.register("LambdaSqsHandler", c => new PingPongSqsHandler(c.get(LambdaConfig_1.LambdaConfig), c.get('SQS')));
        });
    }
}
exports.MyLambdaModule = MyLambdaModule;
//# sourceMappingURL=index.js.map