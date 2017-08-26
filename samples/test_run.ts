import * as Mongoose from 'mongoose';
import { injectable } from "inversify";

import 'reflect-metadata';

import { AggregateModel } from "./../src/infrastructure/db_schema/AggregateModel";
import { EventModel } from './../src/infrastructure/db_schema/EventModel';

import { AggregateBase } from './../src/infrastructure/interface/IAggregate';

interface IStorageEngine {
    startStream<IAggregateRoot>(): any;
}

@injectable()
export class StorageEngine implements IStorageEngine {
    private readonly connectionInstance: Mongoose.Connection;

    constructor(connString: string) {
        Mongoose.connect(connString);

        this.connectionInstance = Mongoose.connection;

        this.connectionInstance.on('error', this.onConnectionError);
        this.connectionInstance.on('open', this.onConnectionOpened);

        console.log('MongoDB intance', this.connectionInstance);
    }

    startStream<IAggregateRoot>(): any {
        const newStreamData = new AggregateBase(new Mongoose.Types.ObjectId(), 0, new Date());
        const newStream = new AggregateModel(newStreamData);

        newStream.save({ safe: true, validateBeforeSave: true }, this.onEntitySave);
    }

    onEntitySave = (err: Error, item: any) => {
        if (err) return console.error('Error while saving entity', err);
        console.log('SAVED ENTITY', item);
        console.log('Exiting....');
        process.exit();
    }

    onConnectionError = (err: any): void => console.log('MongoDb connection err ', err);
    onConnectionOpened = (): void => {
        console.log('MongoDb Connected ');
    }
}

const connString = 'mongodb://localhost/event_storage';
const engine = new StorageEngine(connString);

engine.startStream();

