package org.example.controller;

import org.example.model.PortfolioAsset;
import org.example.service.PortfolioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/portfolio")
public class PortfolioController {

    private final PortfolioService service;

    public PortfolioController(PortfolioService service) {
        this.service = service;
    }

    @PostMapping("/buy")
    public PortfolioAsset buy(@RequestParam String ticker, @RequestParam double quantity) {
        return service.buyAsset(ticker, quantity);
    }

    @PostMapping("/sell")
    public PortfolioAsset sell(@RequestParam String ticker, @RequestParam double quantity) {
        return service.sellAsset(ticker, quantity);
    }

    @GetMapping
    public List<PortfolioAsset> getAll() {
        return service.getAllAssets();
    }

    @GetMapping("/value")
    public Map<String, Double> totalValue() {
        return Map.of("totalValue", service.getTotalPortfolioValue());
    }
}

