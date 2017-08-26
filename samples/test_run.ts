import * as Mongoose from 'mongoose';
import { injectable } from "inversify";

import 'reflect-metadata';

import { IAggregateRoot, Aggregate } from "./../src/infrastructure/db_schema/Aggregate";
import { Event } from './../src/infrastructure/db_schema/Event';

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
        const newStream = new Aggregate({
            _id: new Mongoose.Types.ObjectId(),
            Version: 0,
            LastModified: new Date()
        })

        newStream.save({ safe: true, validateBeforeSave: true }, this.onEntitySave);
    }

    onEntitySave = (err: Error, item: any) => {
        if (err) return console.error('Error while saving entity', err);
        console.log('SAVED ENTITY', item);
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

