import { LambdaHttpRequest, LambdaHttpResponse } from './LambdaHttpRequest';
import { LambdaSqsRequest } from './LambdaSqsRequest';
import {Injectable, LifecycleParent, LifecycleContext} from 'ferrum-plumbing';

interface Handler<TReq, TCon, TRes> {
  handle(req: TReq, context: TCon): Promise<TRes>;
}

export interface LastHandledRequest {
  lastRequest: LambdaHttpRequest | LambdaSqsRequest;
}

export interface LambdaSqsHandler extends Handler<LambdaSqsRequest, any, any> {
}

export interface LambdaHttpHandler extends Handler<LambdaHttpRequest, any, LambdaHttpResponse> {
}

export class HandlerFactory implements Injectable, LifecycleParent<LambdaHttpRequest | LambdaSqsRequest> {
  constructor(
    private sqsHandler: LambdaSqsHandler,
    private httpHandler: LambdaHttpHandler,
  ) {
  }
  private hType: 'http' | 'sqs' | undefined;

  get(hType: 'http' | 'sqs'): LambdaHttpHandler | LambdaSqsHandler {
    this.hType = hType;
    return hType === 'http' ? this.httpHandler : this.sqsHandler;
  }

  getLifecycleContext(): LifecycleContext<LambdaHttpRequest | LambdaSqsRequest> {
    if (!this.hType) {
      throw new Error('Trying to getLifecycleContext before handling any request');
    }
    const handler: any = this.hType === 'http' ? this.httpHandler : this.sqsHandler;
    if (handler.lastRequest === undefined) {
      throw new Error(`Trying to getLifecycleContext, while handing ${this.hType} request but handler has` +
          ` no 'lastRequest' field. Make sure your handler implements LastHandledRequest and sets 'lastRequest' in the handle method`);
    }
    return { context: {...handler.lastRequest, headers: {}} };
  }

  __name__(): string {
    return 'HandlerFactory';
  }
}
