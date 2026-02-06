package org.example.model;

import jakarta.persistence.*;

@Entity
@Table(name = "watchlist_sectors")
public class WatchlistSector {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    public WatchlistSector() {}

    public WatchlistSector(String name) {
        this.name = name;
    }

    public Long getId() { return id; }
    public String getName() { return name; }

    public void setName(String name) { this.name = name; }
}
