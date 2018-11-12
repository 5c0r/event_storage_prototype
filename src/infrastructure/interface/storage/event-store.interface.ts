import { AggregateRoot, AggreateStreamState } from './../aggregate';
import { IAmEvent } from './../event'
import { Observable } from 'rxjs/Observable';


export interface IWorkWithEvent<T extends AggregateRoot> {

    startStream(aggregate: T, withEvents?: IAmEvent[]): void;

    appendStream(streamId: AAGUID, events: IAmEvent[], newStream: boolean, expectedVersion?: number): void;
    saveStream(aggregate: T);

    getStream(streamId: AAGUID, version?: Number): Observable<T>;
    getStreamState(streamId: AAGUID): Observable<AggreateStreamState>;
    getStreamWithMapReduce(streamId: any, version?: number): Observable<T>;

    getEvents(streamId: AAGUID, version?: Number): Observable<IAmEvent[]>;
}
