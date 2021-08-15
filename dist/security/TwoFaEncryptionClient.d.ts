import { WebNativeCryptor } from "ferrum-crypto";
import { EncryptedData, HexString, Injectable, LoggerFactory } from "ferrum-plumbing";
export declare class TwoFaEncryptionClient implements Injectable {
    private cyptor;
    private uri;
    private apiSecret;
    private apiPub;
    private fetcher;
    constructor(cyptor: WebNativeCryptor, uri: string, logFac: LoggerFactory, apiSecret: string, apiPub: string);
    __name__(): string;
    encrypt(twoFaId: string, twoFa: string, data: HexString): Promise<EncryptedData>;
    newKey(): Promise<{
        keyId: string;
        secret: string;
    }>;
    decrypt(twoFaId: string, twoFa: string, data: EncryptedData): Promise<HexString>;
    private getTwoFaWrapperKey;
}
//# sourceMappingURL=TwoFaEncryptionClient.d.ts.map