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
const Container_1 = require("./ioc/Container");
const HandlerFactory_1 = require("./HandlerFactory");
const LambdaGlobalContext_1 = require("./LambdaGlobalContext");
const LambdaConfig_1 = require("./LambdaConfig");
const aws_sdk_1 = require("aws-sdk");
class LambdaGlobalModule {
    configAsync(container) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            const region = process.env.REGION || LambdaConfig_1.LambdaConfig.DefaultRegion;
            const secretManager = new aws_sdk_1.SecretsManager({ region });
            const config = new LambdaConfig_1.LambdaConfig(secretManager);
            yield config.init();
            Container_1.makeInjectable('SQS', aws_sdk_1.SQS);
            container.register(aws_sdk_1.SQS, () => new aws_sdk_1.SQS());
            container.register(LambdaConfig_1.LambdaConfig, () => config);
            container.register(HandlerFactory_1.HandlerFactory, c => new HandlerFactory_1.HandlerFactory(c.get('LambdaSqsHandler'), c.get('LambdaHttpHandler')));
            container.register(LambdaGlobalContext_1.LambdaGlobalContext, c => new LambdaGlobalContext_1.LambdaGlobalContext(c.get(HandlerFactory_1.HandlerFactory)));
        });
    }
}
exports.LambdaGlobalModule = LambdaGlobalModule;
//# sourceMappingURL=LambdaGlobalModule.js.map