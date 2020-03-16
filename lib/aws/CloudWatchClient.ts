import {Injectable, MetricsUploader} from "ferrum-plumbing";
import CloudWatch = require("aws-sdk/clients/cloudwatch");
import {Metric, ScalarMetric} from "ferrum-plumbing/dist/monitoring/Types";
import {Dimension, MetricDatum, PutMetricDataInput} from "aws-sdk/clients/cloudwatch";

export class CloudWatchClient implements Injectable, MetricsUploader {
  constructor(private cw: CloudWatch, private namespace: string, private dimensions: Dimension[]) {
    this.namespace = `Ferrum/${namespace}`;
    this.uploadMetrics = this.uploadMetrics.bind(this);
  }

  __name__(): string { return 'CloudWatchClient'; }

  async uploadMetrics(metrics: Metric[]) {
    if (!metrics || !metrics.length) {
      return;
    }
    const req = {
      Namespace: this.namespace,
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