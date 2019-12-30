"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HandlerFactory {
    constructor(sqsHandler, httpHandler) {
        this.sqsHandler = sqsHandler;
        this.httpHandler = httpHandler;
    }
    get(hType) {
        this.hType = hType;
        return hType === 'http' ? this.httpHandler : this.sqsHandler;
    }
    getLifecycleContext() {
        if (!this.hType) {
            throw new Error('Trying to getLifecycleContext before handling any request');
        }
        const handler = this.hType === 'http' ? this.httpHandler : this.sqsHandler;
        if (handler.lastRequest === undefined) {
            throw new Error(`Trying to getLifecycleContext, while handing ${this.hType} request but handler has` +
                ` no 'lastRequest' field. Make sure your handler implements LastHandledRequest and sets 'lastRequest' in the handle method`);
        }
        return { context: Object.assign({}, handler.lastRequest, { headers: {} }) };
    }
    __name__() {
        return 'HandlerFactory';
    }
}
exports.HandlerFactory = HandlerFactory;
//# sourceMappingURL=HandlerFactory.js.map