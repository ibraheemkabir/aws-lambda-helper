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
const _1 = require(".");
const LambdaConfig_1 = require("./lib/LambdaConfig");
const aws_sdk_1 = require("aws-sdk");
jest.mock('./lib/LambdaConfig', () => ({
    LambdaConfig: jest.fn().mockImplementation()
}));
jest.mock('aws-sdk', () => ({
    SQS: jest.fn().mockImplementation(() => ({
        sendMessage(msg) {
            this.msg = msg;
            return ({
                promise: jest.fn(),
            });
        },
    })),
    config: {
        update: jest.fn()
    },
}));
test('test http request echos data', () => __awaiter(this, void 0, void 0, function* () {
    const req = {
        queryStringParameters: { 'message': 'testing' },
        httpMethod: 'GET',
    };
    const obj = new _1.EchoHttpHandler();
    const res = yield obj.handle(req, {});
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe('You said testing');
}));
test('test PingPongSqsHandler, sqs ping generates a pong', () => __awaiter(this, void 0, void 0, function* () {
    const req = {
        Records: [
            {
                awsRegion: 'us-east1-a',
                body: '{"message":"ping", "count": 1}',
                eventSourceARN: '...',
            }
        ]
    };
    const mockSqs = new aws_sdk_1.SQS();
    const obj = new _1.PingPongSqsHandler(new LambdaConfig_1.LambdaConfig(jest.fn().mockImplementation()), mockSqs);
    yield obj.handle(req, {});
    // Ensure sqs.sendMessage is called
    expect(mockSqs.msg).toMatchObject({
        MessageBody: '{"message":"pong","count":2}',
    });
}));
//# sourceMappingURL=index.test.js.map