import { LambdaHttpRequest, LambdaHttpResponse } from './LambdaHttpRequest';
import { LambdaSqsRequest } from './LambdaSqsRequest';
import { Injectable } from 'ferrum-plumbing';
interface Handler<TReq, TCon, TRes> {
    handle(req: TReq, context: TCon): Promise<TRes>;
}
export interface LambdaSqsHandler extends Handler<LambdaSqsRequest, any, any> {
}
export interface LambdaHttpHandler extends Handler<LambdaHttpRequest, any, LambdaHttpResponse> {
}
export declare class HandlerFactory implements Injectable {
    private sqsHandler;
    private httpHandler;
    constructor(sqsHandler: LambdaSqsHandler, httpHandler: LambdaHttpHandler);
    get(hType: 'http' | 'sqs'): LambdaHttpHandler | LambdaSqsHandler;
    __name__(): string;
}
export {};
//# sourceMappingURL=HandlerFactory.d.ts.map