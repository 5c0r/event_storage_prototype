import { AggregateBase } from './../src/infrastructure/interface/AggregateBase';
import { EventBase } from './../src/infrastructure/interface/EventBase';

// Sample aggregate creation
export class ValueSet extends EventBase {
    constructor(public Value: number) {
        super();
    }
}

export class NameSet extends EventBase {
    constructor(public anotherValue: string) {
        super();
    }
}

export class MyAggregate extends AggregateBase {

    private testProperty: number;
    private anotherProperty: string;

    public get TestProperty(): number {
        return this.testProperty;
    }

    public get Name(): string {
        return this.anotherProperty;
    }

    constructor() {
        super();
        this.WireUpEvents();
    }

    // Appliers
    private applyMyEvent = (ev: ValueSet): void => {
        this.testProperty = ev.Value;
    }

    private applyMyAnotherEvent = (ev: NameSet): void => {
        this.anotherProperty = ev.anotherValue;
    }
    // End of appliers

    // Setters
    public setValue(newValue: number): this {
        this.RaiseEvent(new ValueSet(newValue));

        return this;
    }

    public setString(newValue: string): this {
        this.RaiseEvent(new NameSet(newValue));

        return this;
    }

    public WireUpEvents(): void {
        this.RegisterEvent<ValueSet>(ValueSet.name, this.applyMyEvent);
        this.RegisterEvent<NameSet>(NameSet.name, this.applyMyAnotherEvent);
    }
}
// End of sample