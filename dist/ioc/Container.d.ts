export declare class ContainerError extends Error {
}
export interface Injectable {
    __name__(): string;
}
export declare function makeInjectable(name: string, type: any): void;
export declare class Container {
    private catalog;
    private stack;
    registerModule(m: Module): Promise<void>;
    get<T>(type: any): T;
    register<T>(type: any, factory: (c: Container) => T): void;
    private name;
}
export interface Module {
    configAsync(c: Container): Promise<void>;
}
//# sourceMappingURL=Container.d.ts.map