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

export class AccountCreated extends EventBase {
    constructor(public readonly name: string, public readonly startBalance: number, public readonly creationDate: Date) {
        super();
    }
}
