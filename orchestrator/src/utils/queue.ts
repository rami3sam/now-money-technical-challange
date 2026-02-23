class Node<T> {
  constructor(public value: T, public next: Node<T> | null = null) {}
}

export class LinkedQueue<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;
  private length = 0;

  enqueue(item: T): void {
    const node = new Node(item);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
  }

  dequeue(): T | undefined {
    if (!this.head) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null; // queue is now empty
    this.length--;
    return value;
  }

  peek(): T | undefined {
    return this.head?.value;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  size(): number {
    return this.length;
  }
}