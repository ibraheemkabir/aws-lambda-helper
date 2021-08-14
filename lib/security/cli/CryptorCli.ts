import {Command, flags} from '@oclif/command';
import { EncryptedData, panick } from 'ferrum-plumbing';
import { LambdaGlobalContext } from '../../LambdaGlobalContext';
import { CryptorModule } from '../CryptorModule';
import { DoubleEncryptiedSecret } from '../DoubleEncryptionService';
import { TwoFaEncryptionClient } from '../TwoFaEncryptionClient';

export class CryptorCli extends Command {
	static description = 'Ferrum crypto command line';

	static flags = {
		help: flags.help({char: 'h'}),
		twoFaId: flags.string({description: '2fa id'}),
		twoFa: flags.string({description: '2fa (6 digit number) from google authenticator'}),
		secretHex: flags.string({description: 'The secret in hex'}),
		secretText: flags.string({description: 'The secret in plain text'}),
		enctyptedKey: flags.string({description: 'Encrypted data key field'}),
		enctyptedData: flags.string({description: 'Encrypted data, data field'}),
		awsSecretKey: flags.string({description: 'The secret in plain text'}),
		awsAccessKeyId: flags.string({description: 'AWS_ACCESS_KEY_ID or env'}),
		awsSecretAccessKeyId: flags.string({description: 'AWS_SECRET_ACCESS_KEY_ID or env'}),
		awsKmsKeyArn: flags.string({description: 'Kms key ARN to be used for crypto: AWS_KMS_KEY_ARN env'}),
		awsDefaultRegion: flags.string({description: 'AWS_DEFAULT_REGION env'}),
		twoFaApiUrl: flags.string({description: 'TWOFA_API_URL env'}),
		twoFaApiSecretKey: flags.string({description: 'TWOFA_API_SECRET_KEY env'}),
		twoFaApiAccessKey: flags.string({description: 'TWOFA_API_ACCESS_KEY env'}),
	}

	static args = [
		{
			name: 'command',
			require: true,
			description: 'Crypto commands',
			options: ['new-2fa', 'encrypt', 'decrypt'],
		}
	]

	async run() {
		const {args, flags} = this.parse(CryptorCli);
		console.log('Received: ', args, {flags});

    	const container = await LambdaGlobalContext.container();
		container.registerModule(new CryptorModule(
			flags.twoFaApiUrl || process.env.TWOFA_API_URL || panick('TWOFA_API_URL required') as any,
			flags.twoFaApiSecretKey || process.env.TWOFA_API_SECRET_KEY || panick('TWOFA_API_SECRET_KEY required') as any,
			flags.twoFaApiAccessKey || process.env.TWOFA_API_ACCESS_KEY || panick('TWOFA_API_ACCESS_KEY required') as any,
			flags.awsKmsKeyArn || process.env.AWS_KMS_KEY_ARN || panick('AWS_KMS_KEY_ARN required') as any,
		));

		switch(args.command) {
			case 'encrypt':
				const dataToEncrypt = flags.secretHex || (flags.secretText ? Buffer.from(flags.secretText!, 'utf-8').toString('hex') :
					panick('--secretHex or --secretText is required') as any);
				const res = await container.get<DoubleEncryptiedSecret>(DoubleEncryptiedSecret).encrypt(
					flags.twoFaId || panick('--twoFaId is required') as any,
					flags.twoFa || panick('--twoFa is required') as any,
					dataToEncrypt,
				);
				console.log('Data (hex encrypted):')
				console.log(dataToEncrypt);
				console.log('Result:');
				console.log(res);
				return;
			case 'decrypt':
				const doubleEnc = container.get<DoubleEncryptiedSecret>(DoubleEncryptiedSecret);
				await doubleEnc.init(
					flags.twoFaId || panick('--towFaId is required') as any,
					flags.twoFa || panick('--twoFa is required') as any,
					{
						key: flags.enctyptedKey || panick('--encryptedKey is required') as any,
						data: flags.enctyptedData || panick('--encryptedData is required') as any,
					} as EncryptedData,
				);
				const secret = await doubleEnc.secret();
				console.log('Secret received:');
				console.log(secret);
				return;
			case 'new-2fa':
				const keys = await container.get<TwoFaEncryptionClient>(TwoFaEncryptionClient).newKey();
				console.log('Two fa keys:');
				console.log(keys);
				return;
		}
	}
}