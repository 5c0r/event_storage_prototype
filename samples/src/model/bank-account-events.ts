import { EventBase } from "../../../src/infrastructure/interface/event-base";

// Sample aggregate creation
export class AccountDeposited extends EventBase {
    constructor(public Value: number) {
        super();
    }
}

export class AccountWithdrawed extends EventBase {
    constructor(public Value: number) {
        super();
    }
}

export class NameSet extends EventBase {
    constructor(public anotherValue: string) {
        super();
    }
}
