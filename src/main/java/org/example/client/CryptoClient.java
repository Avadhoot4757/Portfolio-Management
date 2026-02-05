package org.example.client;

import org.example.dto.MarketQuote;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Component
public class CryptoClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${yahoo.api.key}")
    private String apiKey;

    @Value("${yahoo.api.host}")
    private String apiHost;

    public MarketQuote getCryptoQuote(String symbol) {
        String url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes?region=US&symbols=" + symbol;

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-RapidAPI-Key", apiKey);
        headers.set("X-RapidAPI-Host", apiHost);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
        return parseCryptoResponse(response.getBody(), symbol);
    }

    private MarketQuote parseCryptoResponse(Map<String, Object> body, String symbol) {
        Map<String, Object> quoteResponse = (Map<String, Object>) body.get("quoteResponse");
        List<Map<String, Object>> results = (List<Map<String, Object>>) quoteResponse.get("result");
        Map<String, Object> data = results.get(0);

        return new MarketQuote(
                symbol,
                Double.parseDouble(data.get("regularMarketPrice").toString()),
                Double.parseDouble(data.get("regularMarketChange").toString()),
                Double.parseDouble(data.get("regularMarketChangePercent").toString()),
                Long.parseLong(data.get("regularMarketTime").toString())
        );
    }

    public BigDecimal getHistoricalPrice(String symbol, long timestamp) {
        // We use the historical-data endpoint from RapidAPI
        String url = String.format("https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v3/get-historical-data?symbol=%s&region=US", symbol);

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-RapidAPI-Key", apiKey);
        headers.set("X-RapidAPI-Host", apiHost);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            // IMPORTANT DEBUG: Check your IntelliJ console for this line to see the real data
            System.out.println("DEBUG: Historical Response for " + symbol + ": " + response.getBody());

            return parseHistoricalPrice(response.getBody());
        } catch (Exception e) {
            System.err.println("API Call failed for " + symbol + ": " + e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    private BigDecimal parseHistoricalPrice(Map<String, Object> body) {
        try {
            // RapidAPI returns a 'prices' list at the root
            List<Map<String, Object>> prices = (List<Map<String, Object>>) body.get("prices");

            if (prices != null && !prices.isEmpty()) {
                // Take the most relevant daily entry
                Map<String, Object> targetDay = prices.get(0);
                Object closePrice = targetDay.get("close");

                if (closePrice != null) {
                    return new BigDecimal(closePrice.toString());
                }
            }
        } catch (Exception e) {
            System.err.println("JSON Parsing Error: " + e.getMessage());
        }
        return BigDecimal.ZERO;
    }
} // Final closing brace for the class