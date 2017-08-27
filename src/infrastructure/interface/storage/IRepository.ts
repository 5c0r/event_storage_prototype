import { inject } from 'inversify';
import { IAggregateRoot, IAggreateStreamState } from './../../interface/IAggregate';
import { IAggregateEvent } from './../../interface/IEvent';

import { IMongooseInstance } from './../../interface/storage/IMongoInstance';

export interface IRepository<T extends IAggregateRoot, T1 extends IAggregateEvent> {

    StartStream(aggregate: T, withEvents?: T1[]): void;

    AppendStream(streamId: AAGUID, events: T1[]): void;

    GetStream(streamId: AAGUID, version?: Number): T;
    GetStreamState(streamId: AAGUID): IAggreateStreamState;

    GetEvents(streamId: AAGUID, version?: Number): T1[];

    onEntitySave(err: Error, item: T): void;
}

export class BaseRepository implements IRepository<any, any> {

    constructor(private readonly mongoose: IMongooseInstance) {

    }


    StartStream(aggregate: any, withEvents?: any[]): void {
        throw new Error('Method not implemented.');
    }
    AppendStream(streamId: string, events: any[]): void {
        throw new Error('Method not implemented.');
    }
    GetStream(streamId: string, version?: Number) {
        throw new Error('Method not implemented.');
    }
    GetStreamState(streamId: string): IAggreateStreamState {
        throw new Error('Method not implemented.');
    }
    GetEvents(streamId: string, version?: Number): any[] {
        throw new Error('Method not implemented.');
    }

    private buildAggregate(streamId: string, version?: Number) {
        // Get stream state
        // Get events from stream
        // Build
    }


    onEntitySave = (err: Error, item: any): void => {
        if (err) {
            console.error('Error while saving entity', err);
            process.exit();
        }

        console.log('Saved entity', item);
        process.exit();
    }

}