package org.example.client;

import org.example.dto.MarketQuote;
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
public class BondClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${yahoo.api.key}")
    private String apiKey;

    @Value("${yahoo.api.host}")
    private String apiHost;

    public MarketQuote getBondYield(String symbol) {
        String url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes?region=US&symbols=" + symbol;

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-RapidAPI-Key", apiKey);
        headers.set("X-RapidAPI-Host", apiHost);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
        return parseBondResponse(response.getBody(), symbol);
    }

    private MarketQuote parseBondResponse(Map<String, Object> body, String symbol) {
        Map<String, Object> quoteResponse = (Map<String, Object>) body.get("quoteResponse");
        List<Map<String, Object>> results = (List<Map<String, Object>>) quoteResponse.get("result");
        Map<String, Object> data = results.get(0);

        return new MarketQuote(
                symbol,
                Double.parseDouble(data.get("regularMarketPrice").toString()),  // yield %
                Double.parseDouble(data.get("regularMarketChange").toString()),
                Double.parseDouble(data.get("regularMarketChangePercent").toString()),
                Long.parseLong(data.get("regularMarketTime").toString())
        );
    }
}
