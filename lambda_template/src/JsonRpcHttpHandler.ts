import {AuthenticationVerifyer, ValidationUtils} from "ferrum-plumbing";
import {JsonRpcProxyRequest, LambdaHttpRequest, LambdaHttpResponse, LambdaHttpHandler,} from "aws-lambda-helper";

function asRequest(body: any | string): JsonRpcProxyRequest {
    return (typeof body === 'string') ? JSON.parse(body) : body;
}

export class JsonRpcHttpHandler implements LambdaHttpHandler {
    constructor(private authVerifyer: AuthenticationVerifyer) { }

    async handle(request: LambdaHttpRequest): Promise<LambdaHttpResponse> {
        if (!this.authVerifyer.isValid(request.headers)) {
            return {
                body: 'Unauthorized',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'text/html',
                },
                isBase64Encoded: false,
                statusCode: 401,
            };
        }
        let body: any = undefined;
        const req = asRequest(request.body);
        switch (req.command) {
            case 'echo':
                const userId = (req.userProfile || {}).USER_ID;
                const email = (req.userProfile || {}).EMAIL;
                ValidationUtils.isTrue(!!email, '"email" must be provided');
                ValidationUtils.isTrue(!!email, '"userId" must be provided');
                body = { userId, email };
                break;
            default:
                body = { error: 'bad request' }
        }
        return {
            body: JSON.stringify(body),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            isBase64Encoded: false,
            statusCode: 200,
        } as LambdaHttpResponse;
    }
}
