# Portfolio Manager

A Spring Boot service for tracking a simple investment portfolio and retrieving live market quotes for stocks, bonds, and crypto. It persists portfolio holdings in MySQL and computes portfolio performance (invested value, current value, and P&L) using live prices.

This repo also includes a modern dark-mode React dashboard frontend under `frontend/`.

## What This App Does
- Fetches live market quotes via Yahoo Finance RapidAPI.
- Lets you buy/sell assets and store holdings in MySQL.
- Computes total portfolio value and per-asset/overall performance.
- Provides a professional dashboard UI with charts, tables, and summary cards.

## Tech Stack
- Java 17
- Spring Boot 3.3.5
- Spring Web (REST APIs)
- Spring Data JPA (persistence)
- MySQL
- Springdoc OpenAPI UI
- React 18 (JavaScript)
- Axios
- Chart.js
- Framer Motion
- Plain CSS

## Project Structure (Key Files)
- `src/main/java/org/example/PortfolioManagerApplication.java` - Spring Boot entry point.
- `src/main/java/org/example/controller/` - REST controllers.
- `src/main/java/org/example/service/PortfolioService.java` - Business logic.
- `src/main/java/org/example/client/` - External market data clients.
- `src/main/java/org/example/model/` - Entities and response models.
- `src/main/java/org/example/repository/PortfolioRepository.java` - JPA repository.
- `src/main/resources/application.properties` - App config.
- `frontend/src/` - React dashboard app (components, services, styles).

## Prerequisites
- Java 17
- Maven
- MySQL running locally
- RapidAPI key for Yahoo Finance
- Node.js (for frontend)

## Quick Start (Backend)
1. Create a MySQL database:
   - `portfolio_db`

2. Configure application properties (see Configuration below).

3. Run the app:
   - `mvn spring-boot:run`

4. App will start on port `8081` by default.

## Frontend (React Dashboard)
The frontend lives in `frontend/` and consumes the backend REST APIs.

### Run the frontend
```bash
cd frontend
npm install
npm start
```

The dev server runs at `http://localhost:3000` and points to the backend at `http://localhost:8081` by default.

### Optional: Set a custom API base URL
PowerShell:
```powershell
setx REACT_APP_API_BASE_URL "http://localhost:8081"
```
Then open a new terminal and run `npm start` again.

### Frontend Features
- Dark-mode portfolio dashboard
- Asset allocation donut chart
- Portfolio performance line chart
- Holdings table with P/L styling
- Add/Remove asset modal actions

## Configuration
The app reads configuration from `src/main/resources/application.properties`.

Required settings:
- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `yahoo.api.key`
- `yahoo.api.host`

Recommended: move secrets to environment variables and reference them in `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/portfolio_db
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASS}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Yahoo Finance (RapidAPI)
yahoo.api.key=${RAPIDAPI_KEY}
yahoo.api.host=apidojo-yahoo-finance-v1.p.rapidapi.com

server.port=8081
```

## API Endpoints
Base URL: `http://localhost:8081`

### Quotes
- `GET /stocks/quote/{symbol}`
- `GET /bonds/quote/{symbol}`
- `GET /crypto/quote/{symbol}`

Example:
```bash
curl http://localhost:8081/stocks/quote/AAPL
```

### Portfolio
- `POST /portfolio/buy?symbol=...&type=...&quantity=...`
- `POST /portfolio/sell?symbol=...&quantity=...`
- `GET /portfolio`
- `GET /portfolio/value`
- `GET /portfolio/performance`

Examples:
```bash
# Buy 2 shares of AAPL
curl -X POST "http://localhost:8081/portfolio/buy?symbol=AAPL&type=STOCK&quantity=2"

# Sell 0.5 BTC
curl -X POST "http://localhost:8081/portfolio/sell?symbol=BTC-USD&quantity=0.5"

# Get portfolio performance
curl http://localhost:8081/portfolio/performance
```

## Data Model
### PortfolioAsset
Stored in MySQL table `portfolio_assets`.
Fields:
- `id` (Long, PK)
- `symbol` (String)
- `assetType` (Enum: `STOCK`, `CRYPTO`, `BOND`)
- `quantity` (Decimal)
- `buyPrice` (Decimal)
- `buyTime` (DateTime)

### Performance Output
`/portfolio/performance` returns:
- Total invested
- Total current value
- Total profit/loss
- Total profit/loss percent
- Per-asset performance entries

## OpenAPI / Swagger UI
Springdoc is included. Start the app and visit:
- `http://localhost:8081/swagger-ui/index.html`

## Notes and Limitations
- Buy price is stored as the last buy price for a symbol, not an average cost.
- Selling does not enforce quantity checks (negative quantities can occur if you sell too much).
- API keys are currently in properties; move them to env vars for safety.
- CoinMarketCap config exists but is not used in code.
- Frontend uses the same REST APIs and expects the backend to be running on `8081`.

## Suggested Next Improvements
- Average cost basis per symbol when buying multiple times.
- Validate sell quantity and return clear error responses.
- Add DTO validation annotations and error handling.
- Add integration tests and a Docker Compose setup for MySQL.

## License
This project is for educational purposes. Add a license if you plan to distribute.
