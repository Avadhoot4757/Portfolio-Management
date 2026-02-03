package org.example.dto;

public class MarketQuote {
    private String symbol;
    private double price;
    private double change;
    private double changePercent;
    private long timestamp;

    public MarketQuote(String symbol, double price, double change, double changePercent, long timestamp) {
        this.symbol = symbol;
        this.price = price;
        this.change = change;
        this.changePercent = changePercent;
        this.timestamp = timestamp;
    }

    public String getSymbol() { return symbol; }
    public double getPrice() { return price; }
    public double getChange() { return change; }
    public double getChangePercent() { return changePercent; }
    public long getTimestamp() { return timestamp; }
}
