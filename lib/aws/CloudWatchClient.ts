import {Injectable, MetricsUploader} from "ferrum-plumbing";
import CloudWatch = require("aws-sdk/clients/cloudwatch");
import {Metric, ScalarMetric} from "ferrum-plumbing/dist/monitoring/Types";
import {Dimension, MetricDatum, PutMetricDataInput} from "aws-sdk/clients/cloudwatch";

export class CloudWatchClient implements Injectable, MetricsUploader {
  constructor(private cw: CloudWatch, private dimensions: Dimension[]) {
  }

  __name__(): string { return 'CloudWatchClient'; }

  async uploadMetrics(metrics: Metric[]) {
    if (!metrics || !metrics.length) {
      return;
    }
    const req = {
      Namespace: 'Ferrum/ChainNodeWatcher',
      MetricData: metrics.map(m => ({
        Dimensions: this.dimensions,
        MetricName: m.key,
        Value: (m as ScalarMetric).count,
        Unit: m.unit,
      } as MetricDatum)),
    } as PutMetricDataInput;
    await this.cw.putMetricData(req).promise();
  }
}