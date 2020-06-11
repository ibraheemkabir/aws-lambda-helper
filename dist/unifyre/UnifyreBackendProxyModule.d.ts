import { Module, Container } from "ferrum-plumbing";
export declare class UnifyreBackendProxyModule implements Module {
    private wyreAppId;
    private randomKey;
    constructor(wyreAppId: string, randomKey: string);
    configAsync(container: Container): Promise<void>;
}
//# sourceMappingURL=UnifyreBackendProxyModule.d.ts.map