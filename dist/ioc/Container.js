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
class ContainerError extends Error {
}
exports.ContainerError = ContainerError;
function makeInjectable(name, type) {
    type.prototype.__name__ = () => name;
}
exports.makeInjectable = makeInjectable;
class Container {
    constructor() {
        this.catalog = {};
        this.stack = new Set();
    }
    registerModule(m) {
        return __awaiter(this, void 0, void 0, function* () {
            yield m.configAsync(this);
        });
    }
    get(type) {
        const name = this.name(type);
        if (!this.catalog[name]) {
            throw new ContainerError(`Type ${name} is not registered with the container`);
        }
        if (this.stack.has(name)) {
            throw new ContainerError(`Type ${name} is in a recursive definition loop: ${Array.from(this.stack)}`);
        }
        this.stack.add(name);
        const res = this.catalog[name](this);
        this.stack.delete(name);
        return res;
    }
    register(type, factory) {
        const name = this.name(type);
        this.catalog[name] = factory;
    }
    name(type) {
        if (typeof type === 'string') {
            return type;
        }
        if (!type.prototype.__name__) {
            throw new ContainerError(`Type ${type.toString()} does not implement Injectable `);
        }
        return type.prototype.__name__();
    }
}
exports.Container = Container;
//# sourceMappingURL=Container.js.map