import { Connection } from 'mongoose';
import { MongooseConfig } from "./Types";
import { Injectable } from "ferrum-plumbing";
export declare abstract class MongooseConnection implements Injectable {
    private isInit;
    init(config: MongooseConfig): Promise<void>;
    protected verifyInit(): void;
    abstract initModels(con: Connection): void;
    __name__(): string;
}
//# sourceMappingURL=MongooseConnector.d.ts.map