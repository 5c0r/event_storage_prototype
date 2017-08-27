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

const connString = 'mongodb://localhost/event_storage';


const Injections = {
    ConnectionString: connString,
    MongooseInstance: new BaseMongooseInstance(null)
}

// Enum , Id generation strategy
enum IdentifierStrategy {
    Default = 0,
    Advanced = 1
}

// Sample aggregate creation
class MyEvent extends EventBase {
    constructor(public Value: number) {
        super();
    }
}

class MyAnotherEvent extends EventBase {
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

        this.RegisterEvent<MyEvent>(MyEvent.name, this.applyMyEvent);
        this.RegisterEvent<MyAnotherEvent>(MyAnotherEvent.name, this.applyMyAnotherEvent);
    }

    private applyMyEvent = (ev: MyEvent): void => {
        this.testProperty = ev.Value;
    }

    private applyMyAnotherEvent = (ev: MyAnotherEvent): void => {
        this.anotherProperty = ev.anotherValue;
    }

    public setValue(newValue: number): this {
        this.RaiseEvent(new MyEvent(newValue));

        return this;
    }

    public setString(newValue: string): this {
        this.RaiseEvent(new MyAnotherEvent(newValue));

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
        // this.mongooseInstance.initialize()
    }

    run() {
        const newAggregate = new MyAggregate();

        newAggregate.setValue(10).setString("Name");

        console.log('NewAggregate uncommitted events', newAggregate.UncommittedEvents);
        console.log('NewAggreagte testProperty = ', newAggregate.Name, newAggregate.TestProperty);
    }

}

const program = new MainProgram();
program.run();

// interface IStorageEngine {
//     startStream<IAggregateRoot>(): any;
// }

// @injectable()
// export class StorageEngine implements IStorageEngine {
//     private readonly connectionInstance: Mongoose.Connection;

//     constructor(connString: string) {
//         Mongoose.connect(connString);

//         this.connectionInstance = Mongoose.connection;

//         this.connectionInstance.on('error', this.onConnectionError);
//         this.connectionInstance.on('open', this.onConnectionOpened);

//         console.log('MongoDB intance', this.connectionInstance);
//     }

//     startStream<IAggregateRoot>(): any {
//         const newStreamData = new AggregateBase(new Mongoose.Types.ObjectId(), 0, new Date());
//         const newStream = new AggregateModel(newStreamData);

//         newStream.save({ safe: true, validateBeforeSave: true }, this.onEntitySave);
//     }

//     onEntitySave = (err: Error, item: any) => {
//         if (err) return console.error('Error while saving entity', err);
//         console.log('SAVED ENTITY', item);
//         console.log('Exiting....');
//         process.exit();
//     }

//     onConnectionError = (err: any): void => console.log('MongoDb connection err ', err);
//     onConnectionOpened = (): void => {
//         console.log('MongoDb Connected ');
//     }
// }

// const engine = new StorageEngine(connString);

// engine.startStream();

