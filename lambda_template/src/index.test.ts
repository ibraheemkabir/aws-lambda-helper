import {EchoHttpHandler, PingPongSqsHandler} from '.';
import {SQS} from 'aws-sdk';
import {SendMessageRequest} from "aws-sdk/clients/sqs";
import {LambdaConfig, LambdaHttpRequest, LambdaSqsRequest} from "aws-lambda-helper";

jest.mock('./lib/LambdaConfig', () => ({
    LambdaConfig: jest.fn().mockImplementation()
}));

jest.mock('aws-sdk', () => ({
    SQS: jest.fn().mockImplementation(() => ({
        sendMessage(msg: any) {
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

test('test http request echos data', async () => {
    const req = {
        queryStringParameters: { 'message': 'testing' },
        httpMethod: 'GET',
    } as LambdaHttpRequest;
    const obj = new EchoHttpHandler();
    const res = await obj.handle(req, {});
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe('You said testing');
});

test('test PingPongSqsHandler, sqs ping generates a pong', async () => {
    const req = {
        Records: [
            {
                awsRegion: 'us-east1-a',
                body: '{"message":"ping", "count": 1}',
                eventSourceARN: '...',
            }
        ]
    } as LambdaSqsRequest;
    const mockSqs = new SQS() as any;
    const obj = new PingPongSqsHandler(new LambdaConfig(jest.fn().mockImplementation() as any), mockSqs)
    await obj.handle(req, {});
    // Ensure sqs.sendMessage is called
    expect(mockSqs.msg).toMatchObject<SendMessageRequest>({
        MessageBody: '{"message":"pong","count":2}',
    } as any);
});
