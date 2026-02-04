package org.example.controller;

import org.example.dto.MarketQuote;
import org.example.model.WatchlistAsset;
import org.example.model.AssetType;
import org.example.service.WatchlistService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/watchlist")
public class WatchlistController {

    private final WatchlistService service;

    public WatchlistController(WatchlistService service) {
        this.service = service;
    }

    @PostMapping("/add")
    public WatchlistAsset add(@RequestParam String symbol,
                              @RequestParam AssetType type) {
        return service.add(symbol, type);
    }

    @PostMapping("/remove/{symbol}")
    public void remove(@PathVariable String symbol) {
        service.remove(symbol);
    }

    @GetMapping
    public List<WatchlistAsset> getAll() {
        return service.getAll();
    }

    @GetMapping("/live")
    public List<MarketQuote> live() {
        return service.getLiveWatchlist();
    }
}
