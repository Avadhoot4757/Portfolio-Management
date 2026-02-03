package org.example.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
public class MarketClient {

    private final RestTemplate restTemplate = new RestTemplate();

    public double getLivePrice(String ticker) {
        String url = "https://c4rm9elh30.execute-api.us-east-1.amazonaws.com/default/cachedPriceData?ticker=" + ticker;

        Map response = restTemplate.getForObject(url, Map.class);

        if (response == null || response.get("price_data") == null) {
            throw new RuntimeException("Invalid API response");
        }

        Map priceData = (Map) response.get("price_data");

        if (priceData.get("close") == null) {
            throw new RuntimeException("Close prices not found");
        }

        List closePrices = (List) priceData.get("close");

        if (closePrices.isEmpty()) {
            throw new RuntimeException("No price data available");
        }

        // 🔥 latest market price = last close
        return Double.parseDouble(closePrices.get(closePrices.size() - 1).toString());
    }
}
