import { AuthenticationProvider, AuthenticationVerifyer } from "ferrum-plumbing";
export declare class HmacAuthProvider implements AuthenticationProvider, AuthenticationVerifyer {
    private postData;
    private secret?;
    private publicKey?;
    private publicToSecret?;
    constructor(postData: string, secret?: string | undefined, publicKey?: string | undefined, publicToSecret?: ((k: string) => Promise<string>) | undefined);
    asHeader(): {
        key: string;
        value: string;
    };
    private hash;
    getAuthSession(): string;
    isValid(headers: any): boolean;
    isValidAsync(headers: any): Promise<boolean>;
    verify(headers: any): void;
    verifyAsync(headers: any): Promise<void>;
}
//# sourceMappingURL=HmacAuthProvider.d.ts.map