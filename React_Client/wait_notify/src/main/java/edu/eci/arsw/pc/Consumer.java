package edu.eci.arsw.pc;

import java.util.concurrent.atomic.AtomicLong;

public final class Consumer implements Runnable {
  private final AtomicLong counter;
  private final long delayMs;
  private final Object queue; // BusySpinQueue<?> or BoundedBuffer<?>
  private volatile boolean running = true;
  private Thread myThread;

  public Consumer(Object queue, AtomicLong counter, long delayMs) {
    this.queue = queue;
    this.counter = counter;
    this.delayMs = delayMs;
  }

  public void stop() {
    running = false;
    if (myThread != null)
      myThread.interrupt();
  }

  @Override
  public void run() {
    myThread = Thread.currentThread();
    try {
      while (running) {
        if (queue instanceof BusySpinQueue<?> sp) {
          @SuppressWarnings("unchecked")
          BusySpinQueue<Long> q = (BusySpinQueue<Long>) sp;
          q.take();
        } else if (queue instanceof BoundedBuffer<?> bb) {
          @SuppressWarnings("unchecked")
          BoundedBuffer<Long> q = (BoundedBuffer<Long>) bb;
          q.take();
        }
        counter.incrementAndGet();
        if (delayMs > 0)
          Thread.sleep(delayMs);
      }
    } catch (InterruptedException ie) {
      Thread.currentThread().interrupt();
    }
  }
}
