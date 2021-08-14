import { Container, Module } from 'ferrum-plumbing';
export declare class CryptorModule implements Module {
    private twoFaApiUri;
    private twoFaApiSecret;
    private twoFaApiAccess;
    private kmsKeyArn;
    constructor(twoFaApiUri: string, twoFaApiSecret: string, twoFaApiAccess: string, kmsKeyArn: string);
    configAsync(c: Container): Promise<void>;
}
//# sourceMappingURL=CryptorModule.d.ts.map