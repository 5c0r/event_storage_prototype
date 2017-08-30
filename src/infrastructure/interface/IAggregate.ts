import * as Mongoose from 'mongoose';
import { IEvent } from "./IEvent";

// TODO: other field as ObjectId
export interface IAggregateRoot {
    _id: any;
    Version: number;
    LastModified: Date;

    UncommittedEvents: IEvent[];
    CommittedEvents: IEvent[];
}

export interface IAggreateStreamState {
    StreamId: any;
    CurrentVersion: Number;
}


export type IAggregateRootDbSchema = Mongoose.Document & IAggregateRoot;
