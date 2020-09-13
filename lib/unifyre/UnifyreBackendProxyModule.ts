import { Module, Container } from "ferrum-plumbing";
import { UnifyreBackendProxyService } from "./UnifyreBackendProxyService";
import { UnifyreExtensionKitClient, ServerApi, RequestSigner, UnifyreExtensionKitClientImpl } from "unifyre-extension-sdk";
import { WalletJsonRpcClient } from "unifyre-extension-sdk/dist/client/WalletJsonRpcClient";

export class UnifyreBackendProxyModule implements Module {
    constructor (private wyreAppId: string,
        private randomKey: string,
        private signingKey: string,
        ) { }

    async configAsync(container: Container): Promise<void> {
        container.registerSingleton(RequestSigner, c => new RequestSigner(this.signingKey));
        container.register(UnifyreExtensionKitClient, c => new UnifyreExtensionKitClientImpl(
            c.get(ServerApi), c.get(WalletJsonRpcClient), this.wyreAppId,
            c.get(RequestSigner),));
        container.registerSingleton(UnifyreBackendProxyService,  c => new UnifyreBackendProxyService(
            () => c.get(UnifyreExtensionKitClient),
            this.randomKey,
        ));
    }
}