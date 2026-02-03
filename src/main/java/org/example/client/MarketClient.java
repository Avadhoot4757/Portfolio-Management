package org.example.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Component
public class MarketClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${yahoo.api.key}")
    private String apiKey;

    @Value("${yahoo.api.host}")
    private String apiHost;

    public double getLivePrice(String ticker) {
        // Ensure symbols like ^FVX are correctly formatted
        String url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes?region=US&symbols=" + ticker;

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-RapidAPI-Key", apiKey);
        headers.set("X-RapidAPI-Host", apiHost);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            // ResponseEntity will now handle the encoded caret correctly
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            return parseYahooPrice(response.getBody(), ticker);
        } catch (Exception e) {
            // Log the actual error message from RapidAPI to see if it's a 429 (Rate Limit) or 500
            throw new RuntimeException("API Connection failed for ticker: " + ticker + ". Error: " + e.getMessage());
        }
    }

    private double parseYahooPrice(Map<String, Object> responseBody, String ticker) {
        try {
            // Drill down: quoteResponse -> result [List] -> First Object -> regularMarketPrice
            Map<String, Object> quoteResponse = (Map<String, Object>) responseBody.get("quoteResponse");
            List<Map<String, Object>> results = (List<Map<String, Object>>) quoteResponse.get("result");

            if (results == null || results.isEmpty()) {
                throw new RuntimeException("No data found for ticker: " + ticker);
            }

            Map<String, Object> firstResult = results.get(0);

            // regularMarketPrice is the standard field for current price across all assets
            Object price = firstResult.get("regularMarketPrice");

            if (price == null) {
                throw new RuntimeException("Price data missing for: " + ticker);
            }

            return Double.parseDouble(price.toString());
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Yahoo price data for: " + ticker, e);
        }
    }
}