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
class CloudWatchClient {
    constructor(cw, dimensions) {
        this.cw = cw;
        this.dimensions = dimensions;
    }
    __name__() { return 'CloudWatchClient'; }
    uploadMetrics(metrics) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!metrics || !metrics.length) {
                return;
            }
            const req = {
                Namespace: 'Ferrum/ChainNodeWatcher',
                MetricData: metrics.map(m => ({
                    Dimensions: this.dimensions,
                    MetricName: m.key,
                    Value: m.count,
                    Unit: m.unit,
                })),
            };
            yield this.cw.putMetricData(req).promise();
        });
    }
}
exports.CloudWatchClient = CloudWatchClient;
//# sourceMappingURL=CloudWatchClient.js.map