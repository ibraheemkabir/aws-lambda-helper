import {
    SecureDataStorageBase,
    SecureDataStorageItem,
    secureDataStorageItemSchemaFactory
} from "./SecureDataStorageBase";
import {KmsCryptor} from "../../aws/KmsCryptor";
import {Connection, Document, Schema} from "mongoose";
import {TestDummyCryptorService} from "./TestDummyCryptorService";
import {MongooseConfig} from "../mongoose/Types";

const testDataSchema: Schema = secureDataStorageItemSchemaFactory({});
export const TestStorageModel = (c: Connection) => c.model<SecureDataStorageItem&Document>(
    'SsmsData', testDataSchema, 'testSsmsData');

export class TestStorage extends SecureDataStorageBase<{}, {}> {
    constructor(kms: KmsCryptor) {
        super(kms);
    }

    initModels(con: Connection): void {
        super.setModel(TestStorageModel(con));
    }
}

test('Save an load some data', async function () {
    jest.setTimeout(1000000);
    const conf = {
        database: process.env.TEST_DATABASE,
        endpoint: process.env.TEST_ENDPOINT,
        user: process.env.TEST_USER,
        pw: process.env.TEST_PW,
    } as MongooseConfig;

    const kms = new TestDummyCryptorService();
    const storage = new TestStorage(kms);
    await storage.init(conf);

    const testData = {
        MY_NAME: 'THIS IS MY NAME',
        MY_SECRET: 'SOMETHING SECRET!!!',
    };

    await storage.save('TEST_KEY', testData);
    const actual = await storage.load('TEST_KEY');
    expect(actual['MY_NAME']).toBe(testData.MY_NAME);
});