import * as Mongoose from 'mongoose';

export interface IAggregateRoot {
    _id: any;
    Version: number;
    LastModified: Date;
}

export interface IAggreateStreamState {
    
}

export type IAggregateRootDbSchema = Mongoose.Document & IAggregateRoot;
