"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HandlerFactory {
    constructor(sqsHandler, httpHandler) {
        this.sqsHandler = sqsHandler;
        this.httpHandler = httpHandler;
    }
    get(hType) {
        return hType === 'http' ? this.httpHandler : this.sqsHandler;
    }
    __name__() {
        return 'HandlerFactory';
    }
}
exports.HandlerFactory = HandlerFactory;
//# sourceMappingURL=HandlerFactory.js.map