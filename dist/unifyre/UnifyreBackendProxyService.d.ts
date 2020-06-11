import { UnifyreExtensionKitClient } from 'unifyre-extension-sdk';
import { AppUserProfile } from 'unifyre-extension-sdk/dist/client/model/AppUserProfile';
import { Injectable } from 'ferrum-plumbing';
export declare class UnifyreBackendProxyService implements Injectable {
    private unifyreKitFactory;
    private jwtRandomKey;
    constructor(unifyreKitFactory: () => UnifyreExtensionKitClient, jwtRandomKey: string);
    __name__(): string;
    signInToServer(token: string, expiresIn?: string): Promise<[AppUserProfile, string]>;
    signInUsingToken(jsonToken: string): string;
    private newSession;
}
//# sourceMappingURL=UnifyreBackendProxyService.d.ts.map