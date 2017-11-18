import { AggregateRoot, AggreateStreamState } from './../aggregate';
import { Event } from './../event'
import { Observable } from 'rxjs/Observable';


export interface Repository<T extends AggregateRoot> {

    startStream(aggregate: T, withEvents?: Event[]): void;

    appendStream(streamId: AAGUID, events: Event[], newStream: boolean, expectedVersion?: number): void;
    saveStream(aggregate: T);

    getStream(streamId: AAGUID, version?: Number): Observable<T>;
    getStreamState(streamId: AAGUID): Observable<AggreateStreamState>;
    getStreamWithMapReduce(streamId: any, version?: number): Observable<T>;

    getEvents(streamId: AAGUID, version?: Number): Observable<Event[]>;
}
