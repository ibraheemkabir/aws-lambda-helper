import {HandlerFactory} from "./HandlerFactory";
import {Container, Injectable} from "./ioc/Container";
import {LambdaGlobalModule} from "./LambdaGlobalModule";

export class LambdaGlobalContext implements Injectable {
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
        const reqType = !!req.httpMethod ? 'http' :
             'sqs';
        return this.factory.get(reqType).handle(req as any, context as any);
    }

    __name__(): string {
        return 'LambdaGlobalContext';
    }
}

