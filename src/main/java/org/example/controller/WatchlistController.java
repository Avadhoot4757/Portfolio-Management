package org.example.controller;

import org.example.dto.MarketQuote;
import org.example.model.WatchlistAsset;
import org.example.model.AssetType;
import org.example.service.WatchlistService;
import org.example.service.WatchlistSectorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/watchlist")
public class WatchlistController {

    private final WatchlistService service;
    private final WatchlistSectorService sectorService;

    public WatchlistController(WatchlistService service,
                               WatchlistSectorService sectorService) {
        this.service = service;
        this.sectorService = sectorService;
    }

    @PostMapping("/add")
    public WatchlistAsset add(@RequestParam String symbol,
                              @RequestParam AssetType type) {
        return service.add(symbol, type);
    }

    @RequestMapping(path = "/remove/{symbol}", method = {RequestMethod.POST, RequestMethod.DELETE})
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

    @GetMapping("/quote/{symbol}")
    public MarketQuote quote(@PathVariable String symbol) {
        return service.getQuoteForSymbol(symbol);
    }

    @GetMapping("/sectors/catalog")
    public List<String> sectorCatalog() {
        return sectorService.getCatalog();
    }

    @GetMapping("/sectors")
    public List<org.example.model.WatchlistSector> sectors() {
        return sectorService.getAll();
    }

    @PostMapping("/sectors/add")
    public org.example.model.WatchlistSector addSector(@RequestParam String name) {
        return sectorService.add(name);
    }

    @RequestMapping(path = "/sectors/remove/{name}", method = {RequestMethod.POST, RequestMethod.DELETE})
    public void removeSector(@PathVariable String name) {
        sectorService.remove(name);
    }
}
