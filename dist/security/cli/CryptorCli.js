"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const ferrum_plumbing_1 = require("ferrum-plumbing");
const LambdaGlobalContext_1 = require("../../LambdaGlobalContext");
const CryptorModule_1 = require("../CryptorModule");
const DoubleEncryptionService_1 = require("../DoubleEncryptionService");
const TwoFaEncryptionClient_1 = require("../TwoFaEncryptionClient");
class CryptorCli extends command_1.Command {
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const { args, flags } = this.parse(CryptorCli);
            console.log('Received: ', args, { flags });
            const container = yield LambdaGlobalContext_1.LambdaGlobalContext.container();
            container.registerModule(new CryptorModule_1.CryptorModule(flags.twoFaApiUrl || process.env.TWOFA_API_URL || ferrum_plumbing_1.panick('TWOFA_API_URL required'), flags.twoFaApiSecretKey || process.env.TWOFA_API_SECRET_KEY || ferrum_plumbing_1.panick('TWOFA_API_SECRET_KEY required'), flags.twoFaApiAccessKey || process.env.TWOFA_API_ACCESS_KEY || ferrum_plumbing_1.panick('TWOFA_API_ACCESS_KEY required'), flags.awsKmsKeyArn || process.env.AWS_KMS_KEY_ARN || ferrum_plumbing_1.panick('AWS_KMS_KEY_ARN required')));
            switch (args.command) {
                case 'encrypt':
                    const dataToEncrypt = flags.secretHex || (flags.secretText ? Buffer.from(flags.secretText, 'utf-8').toString('hex') :
                        ferrum_plumbing_1.panick('--secretHex or --secretText is required'));
                    const res = yield container.get(DoubleEncryptionService_1.DoubleEncryptiedSecret).encrypt(flags.twoFaId || ferrum_plumbing_1.panick('--twoFaId is required'), flags.twoFa || ferrum_plumbing_1.panick('--twoFa is required'), dataToEncrypt);
                    console.log('Data (hex encrypted):');
                    console.log(dataToEncrypt);
                    console.log('Result:');
                    console.log(res);
                    return;
                case 'decrypt':
                    const doubleEnc = container.get(DoubleEncryptionService_1.DoubleEncryptiedSecret);
                    yield doubleEnc.init(flags.twoFaId || ferrum_plumbing_1.panick('--towFaId is required'), flags.twoFa || ferrum_plumbing_1.panick('--twoFa is required'), {
                        key: flags.enctyptedKey || ferrum_plumbing_1.panick('--encryptedKey is required'),
                        data: flags.enctyptedData || ferrum_plumbing_1.panick('--encryptedData is required'),
                    });
                    const secret = yield doubleEnc.secret();
                    console.log('Secret received:');
                    console.log(secret);
                    return;
                case 'new-2fa':
                    const keys = yield container.get(TwoFaEncryptionClient_1.TwoFaEncryptionClient).newKey();
                    console.log('Two fa keys:');
                    console.log(keys);
                    return;
            }
        });
    }
}
CryptorCli.description = 'Ferrum crypto command line';
CryptorCli.flags = {
    help: command_1.flags.help({ char: 'h' }),
    twoFaId: command_1.flags.string({ description: '2fa id' }),
    twoFa: command_1.flags.string({ description: '2fa (6 digit number) from google authenticator' }),
    secretHex: command_1.flags.string({ description: 'The secret in hex' }),
    secretText: command_1.flags.string({ description: 'The secret in plain text' }),
    enctyptedKey: command_1.flags.string({ description: 'Encrypted data key field' }),
    enctyptedData: command_1.flags.string({ description: 'Encrypted data, data field' }),
    awsSecretKey: command_1.flags.string({ description: 'The secret in plain text' }),
    awsAccessKeyId: command_1.flags.string({ description: 'AWS_ACCESS_KEY_ID or env' }),
    awsSecretAccessKeyId: command_1.flags.string({ description: 'AWS_SECRET_ACCESS_KEY_ID or env' }),
    awsKmsKeyArn: command_1.flags.string({ description: 'Kms key ARN to be used for crypto: AWS_KMS_KEY_ARN env' }),
    awsDefaultRegion: command_1.flags.string({ description: 'AWS_DEFAULT_REGION env' }),
    twoFaApiUrl: command_1.flags.string({ description: 'TWOFA_API_URL env' }),
    twoFaApiSecretKey: command_1.flags.string({ description: 'TWOFA_API_SECRET_KEY env' }),
    twoFaApiAccessKey: command_1.flags.string({ description: 'TWOFA_API_ACCESS_KEY env' }),
};
CryptorCli.args = [
    {
        name: 'command',
        require: true,
        description: 'Crypto commands',
        options: ['new-2fa', 'encrypt', 'decrypt'],
    }
];
exports.CryptorCli = CryptorCli;
//# sourceMappingURL=CryptorCli.js.map