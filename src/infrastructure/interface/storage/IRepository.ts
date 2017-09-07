import { IAggregateRoot, IAggreateStreamState } from './../../interface/IAggregate';
import { IEvent } from './../../interface/IEvent';

import { Observable } from 'rxjs/Observable';


declare const emit: Function;

export interface IRepository<T extends IAggregateRoot> {

    StartStream(aggregate: T, withEvents?: IEvent[]): void;

    AppendStream(streamId: AAGUID, events: IEvent[], newStream: boolean, expectedVersion?: number): void;
    SaveStream(aggregate: T);

    GetStream(streamId: AAGUID, version?: Number): Observable<T>;
    GetStreamState(streamId: AAGUID): Observable<IAggreateStreamState>;
    GetStreamWithMapReduce(streamId: any, version?: number): Observable<T>;

    GetEvents(streamId: AAGUID, version?: Number): Observable<IEvent[]>;
}
