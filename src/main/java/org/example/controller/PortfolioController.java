package org.example.controller;

import org.example.model.AssetType;
import org.example.model.PortfolioAsset;
import org.example.model.PortfolioPerformance;
import org.example.service.PortfolioService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/portfolio")
public class PortfolioController {

    private final PortfolioService service;

    public PortfolioController(PortfolioService service) {
        this.service = service;
    }

    @PostMapping("/buy")
    public PortfolioAsset buy(@RequestParam String symbol,
                              @RequestParam AssetType type,
                              @RequestParam BigDecimal quantity) {
        return service.buyAsset(symbol, type, quantity);
    }

    @PostMapping("/sell")
    public PortfolioAsset sell(@RequestParam String symbol,
                               @RequestParam BigDecimal quantity) {
        return service.sellAsset(symbol, quantity);
    }

    @GetMapping
    public List<PortfolioAsset> getAll() {
        return service.getAllAssets();
    }

    @GetMapping("/value")
    public PortfolioPerformance totalValue() {
        return service.getPerformance();
    }

    @GetMapping("/performance")
    public PortfolioPerformance performance() {
        return service.getPerformance();
    }

    @GetMapping("/{id}")
    public PortfolioPerformance getById(@PathVariable Long id) {
        return service.getPerformanceById(id); // This must throw the ResourceNotFoundException
    }
}
