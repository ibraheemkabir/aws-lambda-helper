import {connect} from 'mongoose';
import {MongooseConfig} from "./Types";
import {Injectable, ValidationUtils} from "ferrum-plumbing";

export abstract class MongooseConnection implements Injectable {
    private isInit: boolean = false;
    async init(config: MongooseConfig): Promise<void> {
        const connStr = `mongodb://${config.user}:${config.pw}@${config.endpoint}/${config.database}`;
        await connect(connStr);
        this.isInit = true;
    }

    protected verifyInit() {
        ValidationUtils.isTrue(this.isInit, 'Mongoose connection is not initialized');
    }

    __name__() { return 'MongooseConnection'; }
}