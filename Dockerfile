# syntax=docker/dockerfile:1.4

FROM mcr.microsoft.com/playwright:v1.54.0-noble

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy test files and config
COPY playwright.config.ts ./
COPY e2e ./e2e

# Run as non-root - create writable dirs before switching user
RUN useradd -m pwuser || true
RUN mkdir -p /app/test-results /app/playwright-report /tmp/playwright && \
    chown -R pwuser:pwuser /app /tmp/playwright
USER pwuser

ENV CI=true

ENTRYPOINT ["npx", "playwright", "test", "--reporter=list"]
