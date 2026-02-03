package org.example.controller;

import org.example.client.MarketClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/market")
public class MarketController {

    private final MarketClient marketClient;

    public MarketController(MarketClient marketClient) {
        this.marketClient = marketClient;
    }

    // 1️⃣ List available stocks
    @GetMapping("/tickers")
    public List<String> getTickers() {
        return List.of("AAPL", "TSLA", "AMZN", "C", "FB");
    }

    // 2️⃣ Get live price
    @GetMapping("/price/{ticker}")
    public Map<String, Object> getPrice(@PathVariable String ticker) {
        double price = marketClient.getLivePrice(ticker);
        return Map.of(
                "ticker", ticker,
                "currentPrice", price
        );
    }

    // 3️⃣ Search stock (same as price lookup)
    @GetMapping("/search")
    public Map<String, Object> search(@RequestParam String ticker) {
        double price = marketClient.getLivePrice(ticker);
        return Map.of(
                "ticker", ticker,
                "currentPrice", price,
                "message", "Stock found"
        );
    }
}
