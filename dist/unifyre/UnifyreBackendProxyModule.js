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
const UnifyreBackendProxyService_1 = require("./UnifyreBackendProxyService");
const unifyre_extension_sdk_1 = require("unifyre-extension-sdk");
const WalletJsonRpcClient_1 = require("unifyre-extension-sdk/dist/client/WalletJsonRpcClient");
class UnifyreBackendProxyModule {
    constructor(wyreAppId, randomKey) {
        this.wyreAppId = wyreAppId;
        this.randomKey = randomKey;
    }
    configAsync(container) {
        return __awaiter(this, void 0, void 0, function* () {
            container.register(unifyre_extension_sdk_1.UnifyreExtensionKitClient, c => new unifyre_extension_sdk_1.UnifyreExtensionKitClient(c.get(unifyre_extension_sdk_1.ServerApi), c.get(WalletJsonRpcClient_1.WalletJsonRpcClient), this.wyreAppId));
            container.registerSingleton(UnifyreBackendProxyService_1.UnifyreBackendProxyService, c => new UnifyreBackendProxyService_1.UnifyreBackendProxyService(() => c.get(unifyre_extension_sdk_1.UnifyreExtensionKitClient), this.randomKey));
        });
    }
}
exports.UnifyreBackendProxyModule = UnifyreBackendProxyModule;
//# sourceMappingURL=UnifyreBackendProxyModule.js.map