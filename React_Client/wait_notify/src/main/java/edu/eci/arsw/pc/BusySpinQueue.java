package edu.eci.arsw.pc;

import java.util.ArrayDeque;
import java.util.Deque;

/** Intencionalmente incorrecta: usa busy-wait (alto CPU). */
public final class BusySpinQueue<T> {
  private final Deque<T> q = new ArrayDeque<>();
  private final int capacity;

  public BusySpinQueue(int capacity) {
    this.capacity = capacity;
  }

  public void put(T item) {
    // spin hasta que haya espacio
    while (true) {
      synchronized (this) {
        if (q.size() < capacity) {
          q.addLast(item);
          return;
        }
      }
      // espera activa (busy-wait fuera del synchronized para consumir CPU)
      Thread.onSpinWait();
    }
  }

  public T take() {
    // spin hasta que haya elementos
    while (true) {
      synchronized (this) {
        T v = q.pollFirst();
        if (v != null)
          return v;
      }
      // espera activa (busy-wait fuera del synchronized para consumir CPU)
      Thread.onSpinWait();
    }
  }

  public synchronized int size() {
    return q.size();
  }
}
