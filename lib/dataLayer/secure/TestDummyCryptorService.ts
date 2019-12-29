import {arrayBufferToHex, CryptorService} from "ferrum-crypto";
import {EncryptedData, HexString} from "ferrum-plumbing";
import {KmsCryptor} from "../../aws/KmsCryptor";

export class TestDummyCryptorService extends KmsCryptor implements CryptorService {
    constructor() {
        super(null as any, '');
    }

    async decryptToHex(enc: EncryptedData): Promise<HexString> {
        return enc.data.split(':::')[1];
    }

    async encryptHex(data: string): Promise<EncryptedData> {
        return {
            data: 'ENC:::' + data,
            key: 'test_key',
        }
    }

    async sha256(hexData: string): Promise<HexString> {
        const data = new Uint8Array(new ArrayBuffer(32));
        return arrayBufferToHex(data);
    }
}

