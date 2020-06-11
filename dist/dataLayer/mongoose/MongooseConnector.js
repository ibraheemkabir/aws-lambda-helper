"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ferrum_plumbing_1 = require("ferrum-plumbing");
mongoose_1.default.set('useFindAndModify', false);
mongoose_1.default.set('useNewUrlParser', true);
mongoose_1.default.set('useUnifiedTopology', true);
class MongooseConnection {
    constructor() {
        this.isInit = false;
    }
    init(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const connStr = config.connectionString ||
                `mongodb://${config.user}:${config.pw}@${config.endpoint}/${config.database}`;
            const con = yield mongoose_1.createConnection(connStr);
            this.initModels(con);
            this.isInit = true;
        });
    }
    verifyInit() {
        ferrum_plumbing_1.ValidationUtils.isTrue(this.isInit, 'Mongoose connection is not initialized');
    }
    __name__() { return 'MongooseConnection'; }
}
exports.MongooseConnection = MongooseConnection;
//# sourceMappingURL=MongooseConnector.js.map