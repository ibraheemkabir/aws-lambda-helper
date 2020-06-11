import { Module, Container } from "ferrum-plumbing";
import { UnifyreBackendProxyService } from "./UnifyreBackendProxyService";
import { UnifyreExtensionKitClient, ServerApi } from "unifyre-extension-sdk";
import { WalletJsonRpcClient } from "unifyre-extension-sdk/dist/client/WalletJsonRpcClient";

export class UnifyreBackendProxyModule implements Module {
    constructor (private wyreAppId: string, private randomKey: string) { }

    async configAsync(container: Container): Promise<void> {
        container.register(UnifyreExtensionKitClient, c => new UnifyreExtensionKitClient(
            c.get(ServerApi), c.get(WalletJsonRpcClient), this.wyreAppId));
        container.registerSingleton(UnifyreBackendProxyService,  c => new UnifyreBackendProxyService(
            () => c.get(UnifyreExtensionKitClient),
            this.randomKey,
        ));
    }
}