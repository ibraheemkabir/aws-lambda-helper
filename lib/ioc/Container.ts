
export class ContainerError extends Error { }

export interface Injectable {
    __name__(): string;
}

export function makeInjectable(name: string, type: any): void {
    type.prototype.__name__ = () => name;
}

export class Container {
    private catalog: any = {};
    private stack: Set<string> = new Set();

    async registerModule(m: Module) {
        await m.configAsync(this);
    }

    get<T>(type: any): T {
        const name = this.name(type);
        if (!this.catalog[name])  {
            throw new ContainerError(`Type ${name} is not registered with the container`);
        }

        if (this.stack.has(name)) {
            throw new ContainerError(`Type ${name} is in a recursive definition loop: ${Array.from(this.stack)}`);
        }

        this.stack.add(name);
        const res = this.catalog[name](this) as any;
        this.stack.delete(name);
        return res;
    }

    register<T>(type: any, factory: (c: Container) => T): void {
        const name = this.name(type);
        this.catalog[name] = factory;
    }

    private name(type: any): string {
        if (typeof type === 'string') {
            return type;
        }
        if (!type.prototype.__name__) {
            throw new ContainerError(`Type ${type.toString()} does not implement Injectable `);
        }
        return type.prototype.__name__();
    }
}

export interface Module {
    configAsync(c: Container): Promise<void>;
}
