export declare class SecretsProvider {
    private region;
    private secretArn;
    constructor(region: string, secretArn: string);
    get(): Promise<any>;
    randomPassword(len: number): Promise<string>;
}
//# sourceMappingURL=SecretsProvider.d.ts.map