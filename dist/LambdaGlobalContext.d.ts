import { HandlerFactory } from './HandlerFactory';
import { Injectable, Container } from 'ferrum-plumbing';
export declare class LambdaGlobalContext implements Injectable {
    private factory;
    private static _container;
    static container(): Promise<Container>;
    constructor(factory: HandlerFactory);
    handleAsync(req: any, context: any): Promise<any>;
    __name__(): string;
}
//# sourceMappingURL=LambdaGlobalContext.d.ts.map