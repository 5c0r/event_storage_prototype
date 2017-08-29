// Polyfills
import 'reflect-metadata';
// End of polyfills

import * as Mongoose from 'mongoose';
import { injectable, inject } from 'inversify';


import { AggregateModel } from './../src/infrastructure/db_schema/AggregateModel';
import { EventModel } from './../src/infrastructure/db_schema/EventModel';

import { AggregateBase } from './../src/infrastructure/interface/IAggregate';
import { EventBase } from './../src/infrastructure/interface/EventBase';

import { IRepository, BaseRepository } from './../src/infrastructure/interface/storage/IRepository';
import { BaseMongooseInstance, IMongooseInstance } from './../src/infrastructure/interface/storage/IMongoInstance';

const connString = 'mongodb://localhost:27017/event_storage';

const Injections = {
    ConnectionString: connString
}

// Enum , Id generation strategy
enum IdentifierStrategy {
    Default = 0,
    Advanced = 1
}

// Sample aggregate creation
class ValueSet extends EventBase {
    constructor(public Value: number) {
        super();
    }
}

class NameSet extends EventBase {
    constructor(public anotherValue: string) {
        super();
    }
}

class MyAggregate extends AggregateBase {

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

        this.RegisterEvent<ValueSet>(ValueSet.name, this.applyMyEvent);
        this.RegisterEvent<NameSet>(NameSet.name, this.applyMyAnotherEvent);
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
}
// End of sample

@injectable()
class MainProgram {
    private readonly mongooseInstance: IMongooseInstance = new BaseMongooseInstance(connString);
    private readonly repository: IRepository<any, any> = new BaseRepository(this.mongooseInstance);

    constructor() {
        console.log('mongooseInstance', this.mongooseInstance);
        this.mongooseInstance.initialize();
    }

    run() {
        const newAggregate = new MyAggregate();

        for (let i = 0; i < 1000; i++) {
            const random = () => Math.random() * i;
            newAggregate.setValue(random()).setString(`${random()} Name ${random()}`);
        }

        console.log('NewAggregate uncommitted events', newAggregate.UncommittedEvents);
        console.log('NewAggreagte testProperty = ', newAggregate.Name, newAggregate.TestProperty);

        this.repository.StartStream(newAggregate);
    }

}

try {
    const program = new MainProgram();
    program.run();
} catch (err) {
    console.log('Exception', err);
    process.exit(0);
}


