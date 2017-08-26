import * as Mongoose from 'mongoose';

export interface IAggregateRoot {
    _id: any;
    Version: number;
    LastModified: Date;
}

export interface IAggreateStreamState {

}

export class AggregateBase implements IAggregateRoot {
    _id: any;
    Version: number;
    LastModified: Date;

    constructor(id: any, version: number, lastModified: Date) {
        this._id = id;
        this.Version = version;
        this.LastModified = lastModified;
    }
}

export type IAggregateRootDbSchema = Mongoose.Document & IAggregateRoot;
