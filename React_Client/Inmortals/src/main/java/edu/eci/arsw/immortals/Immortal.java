package edu.eci.arsw.immortals;

import java.util.List;
import java.util.Objects;
import java.util.concurrent.ThreadLocalRandom;

import edu.eci.arsw.concurrency.PauseController;

public final class Immortal implements Runnable {
  private final String name;
  private int health;
  private final int damage;
  private final List<Immortal> population;
  private final ScoreBoard scoreBoard;
  private final PauseController controller;
  private volatile boolean running = true;

  public Immortal(String name, int health, int damage, List<Immortal> population, ScoreBoard scoreBoard, PauseController controller) {
    this.name = Objects.requireNonNull(name);
    this.health = health;
    this.damage = damage;
    this.population = Objects.requireNonNull(population);
    this.scoreBoard = Objects.requireNonNull(scoreBoard);
    this.controller = Objects.requireNonNull(controller);
  }

  public String name() { return name; }
  public synchronized int getHealth() { return health; }
  public boolean isAlive() { return getHealth() > 0 && running; }
  public void stop() { running = false; }

  @Override public void run() {
    try {
      while (running && getHealth() > 0) {
        controller.awaitIfPaused();
        if (!running) break;
        var opponent = pickOpponent();
        if (opponent == null) continue;
        String mode = System.getProperty("fight", "ordered");
        if ("naive".equalsIgnoreCase(mode)) fightNaive(opponent);
        else fightOrdered(opponent);
        
        // Check if this immortal died and remove from population
        if (getHealth() <= 0) {
          population.remove(this);
          controller.decrementExpectedThreads();
          break;
        }
        Thread.sleep(2);
      }
    } catch (InterruptedException ie) {
      Thread.currentThread().interrupt();
    } finally {
      // Ensure removal if stopped externally
      if (getHealth() <= 0 && population.contains(this)) {
        population.remove(this);
        controller.decrementExpectedThreads();
      }
    }
  }

  private Immortal pickOpponent() {
    if (population.size() <= 1) return null;
    Immortal other = null;
    int attempts = 0;
    do {
      if (attempts++ > population.size() * 2) return null; // Avoid infinite loop
      int idx = ThreadLocalRandom.current().nextInt(population.size());
      if (idx >= population.size()) continue; // Race condition: size changed
      other = population.get(idx);
    } while (other == this || other.getHealth() <= 0);
    return other;
  }

  private void fightNaive(Immortal other) {
    synchronized (this) {
      synchronized (other) {
        if (this.health <= 0 || other.health <= 0) return;
        // Maintain invariant: total health remains constant
        // Transfer damage from opponent to attacker
        other.health -= this.damage;
        this.health += this.damage;
        scoreBoard.recordFight();
      }
    }
  }

  private void fightOrdered(Immortal other) {
    Immortal first = this.name.compareTo(other.name) < 0 ? this : other;
    Immortal second = this.name.compareTo(other.name) < 0 ? other : this;
    synchronized (first) {
      synchronized (second) {
        if (this.health <= 0 || other.health <= 0) return;
        // Maintain invariant: total health remains constant
        // Transfer damage from opponent to attacker
        other.health -= this.damage;
        this.health += this.damage;
        scoreBoard.recordFight();
      }
    }
  }
}
