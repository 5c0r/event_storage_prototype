import { IAggreateStreamState } from './IAggregate';

export class StreamStateBase implements IAggreateStreamState {
    StreamId: any;
    CurrentVersion: number;

    constructor(streamId?: any, version?: any) {
        this.StreamId = streamId || null;
        this.CurrentVersion = (version + 1) || 1;
    }
}