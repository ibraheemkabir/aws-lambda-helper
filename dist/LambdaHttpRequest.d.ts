export interface LambdaHttpResposne {
    "isBase64Encoded": boolean;
    "statusCode": 200 | 400;
    "headers": any;
    "body": any;
}
export interface LambdaHttpRequest {
    path: string;
    headers: {
        "Accept": string;
        "Accept-Encoding": string;
        "Accept-Language": string;
        "CloudFront-Forwarded-Proto": "https";
        "CloudFront-Is-Desktop-Viewer": boolean;
        "CloudFront-Is-Mobile-Viewer": boolean;
        "CloudFront-Is-SmartTV-Viewer": boolean;
        "CloudFront-Is-Tablet-Viewer": boolean;
        "CloudFront-Viewer-Country": string;
        "Host": string;
        "Upgrade-Insecure-Requests": "1";
        "User-Agent": string;
        "Via": "1.1 fb7cca60f0ecd82ce07790c9c5eef16c.cloudfront.net (CloudFront)";
        "X-Amz-Cf-Id": "nBsWBOrSHMgnaROZJK1wGCZ9PcRcSpq_oSXZNQwQ10OTZL4cimZo3g==";
        "X-Forwarded-For": "192.168.100.1, 192.168.1.1";
        "X-Forwarded-Port": "443";
        "X-Forwarded-Proto": "https";
    };
    "pathParameters": {
        "proxy": string;
    };
    "requestContext": {
        "accountId": string;
        "resourceId": string;
        "stage": "test";
        "requestId": string;
        "identity": {
            "cognitoIdentityPoolId": string;
            "accountId": string;
            "cognitoIdentityId": string;
            "caller": string;
            "apiKey": string;
            "sourceIp": string;
            "cognitoAuthenticationType": string;
            "cognitoAuthenticationProvider": string;
            "userArn": string;
            "userAgent": string;
            "user": string;
        };
        "resourcePath": string;
        "httpMethod": "GET" | "POST";
        "apiId": string;
    };
    "resource": string;
    "httpMethod": "GET" | "POST";
    "queryStringParameters": any;
    "stageVariables": any;
    "isBase64Encoded": boolean;
    "body": string;
}
//# sourceMappingURL=LambdaHttpRequest.d.ts.map