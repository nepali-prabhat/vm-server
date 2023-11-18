import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class SseService<T extends object> {
  private eventSubject = new Subject<MessageEvent>();

  getEventObservable() {
    return this.eventSubject.asObservable();
  }
  emitEvent(data: T) {
    this.eventSubject.next({ data });
  }
}
