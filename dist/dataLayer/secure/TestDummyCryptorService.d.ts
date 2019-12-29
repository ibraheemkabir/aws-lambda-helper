import { CryptorService } from "ferrum-crypto";
import { EncryptedData, HexString } from "ferrum-plumbing";
import { KmsCryptor } from "../../aws/KmsCryptor";
export declare class TestDummyCryptorService extends KmsCryptor implements CryptorService {
    constructor();
    decryptToHex(enc: EncryptedData): Promise<HexString>;
    encryptHex(data: string): Promise<EncryptedData>;
    sha256(hexData: string): Promise<HexString>;
}
//# sourceMappingURL=TestDummyCryptorService.d.ts.map