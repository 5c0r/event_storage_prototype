import { AggreateStreamState } from './aggregate';

export class StreamStateBase implements AggreateStreamState {
    StreamId: any;
    CurrentVersion: number;

    constructor(streamId?: any, version?: any) {
        this.StreamId = streamId || null;
        this.CurrentVersion = (version + 1) || 1;
    }
}