import { HandlerFactory } from './HandlerFactory';
import { LambdaGlobalModule } from './LambdaGlobalModule';
import { Injectable, Container } from 'ferrum-plumbing';

export class LambdaGlobalContext implements Injectable {
    // tslint:disable-next-line:variable-name
  private static _container: Container | undefined;
  static async container(): Promise<Container> {
    if (!LambdaGlobalContext._container) {
      LambdaGlobalContext._container = new Container();
      await LambdaGlobalContext._container.registerModule(new LambdaGlobalModule());
    }
    return LambdaGlobalContext._container;
  }

  constructor(private factory: HandlerFactory) {
  }

  async handleAsync(req: any, context: any): Promise<any> {
    const reqType = req.httpMethod ? 'http' :
             'sqs';
    return this.factory.get(reqType).handle(req as any, context as any);
  }

  __name__(): string {
    return 'LambdaGlobalContext';
  }
}

