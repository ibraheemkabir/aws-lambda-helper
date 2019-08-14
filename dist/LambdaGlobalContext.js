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
const LambdaGlobalModule_1 = require("./LambdaGlobalModule");
const ferrum_plumbing_1 = require("ferrum-plumbing");
class LambdaGlobalContext {
    constructor(factory) {
        this.factory = factory;
    }
    static container() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!LambdaGlobalContext._container) {
                LambdaGlobalContext._container = new ferrum_plumbing_1.Container();
                yield LambdaGlobalContext._container.registerModule(new LambdaGlobalModule_1.LambdaGlobalModule());
            }
            return LambdaGlobalContext._container;
        });
    }
    handleAsync(req, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqType = req.httpMethod ? 'http' :
                'sqs';
            return this.factory.get(reqType).handle(req, context);
        });
    }
    __name__() {
        return 'LambdaGlobalContext';
    }
}
exports.LambdaGlobalContext = LambdaGlobalContext;
//# sourceMappingURL=LambdaGlobalContext.js.map