import { AggregateBase } from './../src/infrastructure/interface/AggregateBase';
import { EventBase } from './../src/infrastructure/interface/EventBase';

// Sample aggregate creation
export class AccountDeposited extends EventBase {
    constructor(public Value: number) {
        super();
    }
}

export class NameSet extends EventBase {
    constructor(public anotherValue: string) {
        super();
    }
}

// Stream of Events 
export class BankAccount extends AggregateBase {

    private balance: number = 0;
    private accountHolder: string = '';

    constructor() {
        super();
        this.WireUpEvents();
    }

    public WireUpEvents(): void {
        this.RegisterEvent<AccountDeposited>(AccountDeposited.name, this.applyMyEvent);
        this.RegisterEvent<NameSet>(NameSet.name, this.applyMyAnotherEvent);
    }

    // Getters
    public get TestProperty(): number {
        return this.balance;
    }
    public get Name(): string {
        return this.accountHolder;
    }
    
    // Setters
    public deposit(newValue: number): this {
        this.RaiseEvent(new AccountDeposited(newValue));
        return this;
    }

    public setName(newValue: string): this {
        this.RaiseEvent(new NameSet(newValue));
        return this;
    }
    // End of setters

    // Appliers
    private applyMyEvent = (ev: AccountDeposited): void => {
        this.balance = this.balance + ev.Value;
    }

    private applyMyAnotherEvent = (ev: NameSet): void => {
        this.accountHolder = ev.anotherValue;
    }
    // End of appliers

}
// End of sample