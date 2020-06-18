import { Module, Container } from "ferrum-plumbing";
export declare class UnifyreBackendProxyModule implements Module {
    private wyreAppId;
    private randomKey;
    private signingKey;
    constructor(wyreAppId: string, randomKey: string, signingKey: string);
    configAsync(container: Container): Promise<void>;
}
//# sourceMappingURL=UnifyreBackendProxyModule.d.ts.map