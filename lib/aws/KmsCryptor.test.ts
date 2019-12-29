import {KmsCryptor} from "./KmsCryptor";
import { KMS } from "aws-sdk";

test('encrypt data', async function() {
   jest.setTimeout(100000);
   const cryptor = new KmsCryptor(new KMS({region: 'us-east-2'}), 'arn:aws:kms:us-east-2:181310517868:key/5600dedc-7db1-4b7e-9f64-022efb53d6f1');
   const data = Buffer.from('Some text', 'utf-8').toString('hex');
   const enc = await cryptor.encryptHex(data);
   expect(enc.data.length).toBe(64);
   const decrypted  = await cryptor.decryptToHex(enc);
   const clean = Buffer.from(decrypted, 'hex').toString('utf-8');
   expect(clean).toBe('Some text');
});

test('random hex', async function() {
   jest.setTimeout(100000);
   const cryptor = new KmsCryptor(new KMS({region: 'us-east-2'}), 'arn:aws:kms:us-east-2:181310517868:key/5600dedc-7db1-4b7e-9f64-022efb53d6f1');
   const sk = await cryptor.randomHex();
   console.log('Random hex: ', sk);
   expect(sk).toBeTruthy();
});