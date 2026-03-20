package edu.eci.arsw.concurrency;

import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public final class PauseController {
  private final ReentrantLock lock = new ReentrantLock();
  private final Condition unpaused = lock.newCondition();
  private final Condition allPaused = lock.newCondition();
  private volatile boolean paused = false;
  private int pausedCount = 0;
  private int expectedThreads = 0;

  public void setExpectedThreads(int count) {
    lock.lock();
    try { expectedThreads = count; }
    finally { lock.unlock(); }
  }

  public void decrementExpectedThreads() {
    lock.lock();
    try {
      expectedThreads--;
      if (pausedCount >= expectedThreads) {
        allPaused.signalAll();
      }
    } finally { lock.unlock(); }
  }

  public void pause() {
    lock.lock();
    try {
      paused = true;
      pausedCount = 0;
    } finally { lock.unlock(); }
  }

  public void resume() {
    lock.lock();
    try {
      paused = false;
      pausedCount = 0;
      unpaused.signalAll();
    } finally { lock.unlock(); }
  }

  public boolean paused() { return paused; }

  public void awaitIfPaused() throws InterruptedException {
    lock.lockInterruptibly();
    try {
      while (paused) {
        pausedCount++;
        if (pausedCount >= expectedThreads) {
          allPaused.signalAll();
        }
        unpaused.await();
        pausedCount--;
      }
    } finally { lock.unlock(); }
  }

  public void waitUntilAllPaused() throws InterruptedException {
    lock.lockInterruptibly();
    try {
      while (paused && pausedCount < expectedThreads) {
        allPaused.await();
      }
    } finally { lock.unlock(); }
  }
}
