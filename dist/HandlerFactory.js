"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function handlePreflight(request) {
    if (request.method === 'OPTIONS' || request.httpMethod === 'OPTIONS') {
        return {
            body: '',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': '*',
            },
            isBase64Encoded: false,
            statusCode: 200,
        };
    }
}
class LambdaHttpHandlerHelper {
    preProcess(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const preFlight = handlePreflight(request);
            if (preFlight) {
                return { preFlight };
            }
            const headers = request.headers;
            const authToken = (headers.authorization || headers.Authorization || '').split(' ')[1];
            request.path = request.path || request.url;
            return { authToken };
        });
    }
}
exports.LambdaHttpHandlerHelper = LambdaHttpHandlerHelper;
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