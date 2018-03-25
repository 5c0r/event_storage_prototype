import { MessageQueue } from './message-queue';
import { } from 'jest';
import { Message } from '../message/message.interface';
import { IHandle, IHandleFn } from '../command/handle.interface';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { setTimeout } from 'timers';

class TestMessage implements Message {

}

class TestHandler implements IHandle<TestMessage> {
    name = 'TestHandler';

    handle: IHandleFn<TestMessage> = (msg: TestMessage): Observable<any> => {
        return of();
    }
}

class AnotherTestHandler implements IHandle<TestMessage> {
    name = 'AnotherTestHandler';

    handle: IHandleFn<TestMessage> = (msg: TestMessage): Observable<any> => {
        return of();
    }
}



describe('Message Queue', () => {
    const queueUnderTest = MessageQueue;

    test('smoke test', () => {
        expect(MessageQueue).toBeTruthy();
    })

    test('should be able to register', () => {
        const handler = new TestHandler();
        const another = new AnotherTestHandler();

        queueUnderTest.Register(handler);
        queueUnderTest.Register(another);

        expect(Object.keys(queueUnderTest.Router).length).toBe(2);
    })

    // TODO: This test does not work yet
    // test('should be able to dispatch a message to the queue', async () => {
    //     const handler = new TestHandler();
    //     const another = new AnotherTestHandler();

    //     const message = new TestMessage();

    //     queueUnderTest.Register(handler);
    //     queueUnderTest.Register(another);

    //     // queueUnderTest q
    //     queueUnderTest.GetInstance().subscribe( res => {
    //         expect(res).toBe(null);
    //     })

    //     expect(Object.keys(queueUnderTest.Router).length).toBe(1);

    //     queueUnderTest.Send(message);
    // })
})