import { Injectable, MetricsUploader } from "ferrum-plumbing";
import CloudWatch = require("aws-sdk/clients/cloudwatch");
import { Metric } from "ferrum-plumbing/dist/monitoring/Types";
import { Dimension } from "aws-sdk/clients/cloudwatch";
export declare class CloudWatchClient implements Injectable, MetricsUploader {
    private cw;
    private dimensions;
    constructor(cw: CloudWatch, dimensions: Dimension[]);
    __name__(): string;
    uploadMetrics(metrics: Metric[]): Promise<void>;
}
//# sourceMappingURL=CloudWatchClient.d.ts.map