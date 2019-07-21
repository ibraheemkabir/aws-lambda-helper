import {handler} from ".";
import {LambdaHttpRequest, LambdaHttpResposne} from "aws-lambda-helper";

test('test http request echos data', async () => {
    const req = {
        queryStringParameters: { 'message': 'testing' },
        httpMethod: 'GET',
    } as LambdaHttpRequest;
    const res = await handler(req, {}) as LambdaHttpResposne;
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe('You said testing');
});
