# pixme-acceptance

Playwright end-to-end acceptance tests for the [Pixme](https://pixme.wattu.com) platform.

[![Tests](https://img.shields.io/endpoint?url=https://papawattu.github.io/pixme-acceptance/badge.json)](https://papawattu.github.io/pixme-acceptance/)

## Test Report

The latest interactive HTML report is published after each test run:

**[View Test Report](https://papawattu.github.io/pixme-acceptance/)**

## Running Tests

### Locally

```bash
npm ci
npx playwright install --with-deps
npx playwright test
```

### Via GitHub Actions

**Manual trigger:**

Run the "Playwright Tests" workflow from the Actions tab. Optionally override the `base_url` input.

**From another repo (repository_dispatch):**

```bash
gh api repos/papawattu/pixme-acceptance/dispatches \
  -f event_type=run-tests \
  -f 'client_payload[base_url]=https://pixme.wattu.com'
```

## Test Suites

| Suite | Description |
|---|---|
| `page-load` | HTML structure, meta tags, custom elements, design tokens |
| `navigation` | Header, footer, toolbar rendering |
| `gallery` | Image gallery loading, grid layout, infinite scroll |
| `filter` | Category and people filter component |
| `image-editor` | Admin image editor (auth, tags, autocomplete, save/cancel) |
| `sse` | Server-Sent Events (live updates) |
| `api` | REST API health, images, categories, people, HTTPS redirect |
| `accessibility` | Keyboard navigation, ARIA attributes, alt text |
| `visual` | Screenshot regression tests |

## Browser Coverage

- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- Mobile Chrome (Pixel 5)
