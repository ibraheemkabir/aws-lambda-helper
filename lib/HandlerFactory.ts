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

export class HandlerFactory implements Injectable {
  constructor(
    private sqsHandler: LambdaSqsHandler,
    private httpHandler: LambdaHttpHandler,
  ) {
  }

  get(hType: 'http' | 'sqs'): LambdaHttpHandler | LambdaSqsHandler {
    return hType === 'http' ? this.httpHandler : this.sqsHandler;
  }

  __name__(): string {
    return 'HandlerFactory';
  }
}
