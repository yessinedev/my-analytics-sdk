Here is a ready-to-use `README.md` file for your project:

````markdown
# My Analytics SDK

A lightweight, framework-agnostic JavaScript analytics SDK to track user interactions on websites without relying on payment or third-party integrations.

---

## Features

- **Core tracking functionality**
  - Track page views automatically
  - Track user clicks globally
  - Track form submissions with details about form inputs
  - Track form engagement (when users focus on forms)
- **Session management**
  - Unique visitor ID persistence using `localStorage`
  - Session IDs with expiration (30 minutes inactivity)
- **Event queue with batching and retry**
  - Events are batched before sending to the backend
  - Failed events are retried with exponential backoff
  - Events persisted in `localStorage` to avoid data loss on page reload or unload
- **Configurable SDK initialization**
  - Enable or disable automatic tracking features via config options

---

## Installation

Install via npm:

```bash
npm install my-analytics-sdk
````

Or include the built script directly in HTML:

```html
<script src="dist/analytics.js"></script>
<script>
  Analytics.init({
    clientId: "your-client-id",
    autoTrackPageViews: true,
    autoTrackClicks: true,
    autoTrackForms: true
  });
</script>
```

---

## Usage

### Initialization

```ts
import { init } from 'my-analytics-sdk';

init({
  clientId: 'your-client-id',
  autoTrackPageViews: true,
  autoTrackClicks: true,
  autoTrackForms: true
});
```

### Manual Event Tracking

```ts
import { track } from 'my-analytics-sdk';

track('custom_event', {
  someProperty: 'someValue',
});
```

---

## How It Works

* The SDK generates a persistent **visitorId** stored in `localStorage`.
* A **sessionId** is created and refreshed after 30 minutes of inactivity.
* Built-in listeners track:

  * Page views on load
  * User clicks globally (with tag name, id, classes, and text)
  * Form submissions (with form metadata and inputs)
  * Form engagement (when users focus on form fields)
* Events are queued and sent in batches to the backend API endpoint.
* Failed sends are retried with exponential backoff and saved locally to avoid data loss.
* Events are enriched with context info like URL, referrer, timestamp, visitor and session IDs.

---

## Configuration Options

| Option               | Type    | Default | Description                                       |
| -------------------- | ------- | ------- | ------------------------------------------------- |
| `clientId`           | string  | `''`    | Your client identifier for tracking               |
| `autoTrackPageViews` | boolean | `false` | Automatically track page view events              |
| `autoTrackClicks`    | boolean | `false` | Automatically track click events                  |
| `autoTrackForms`     | boolean | `false` | Automatically track form submissions & engagement |

---

## Folder Structure

```
src/
  ├── autotrack/
  │   ├── clicks.ts           # Click event tracking
  │   ├── forms.ts            # Form submission and engagement tracking
  │   ├── pageview.ts         # Page view tracking
  │   └── scroll.ts           # (Planned) Scroll depth tracking
  ├── common/
  │   └── index.ts            # Core track() function
  ├── config.ts               # Configuration management
  ├── index.ts                # SDK entry point & init()
  ├── transport.ts            # Event queue and sending logic
  ├── types.ts                # TypeScript types/interfaces
  └── utils.ts                # Utility functions
```

---

## Next Steps

* Implement scroll depth tracking
* Improve session timeline modeling
* Build visual visitor journey mapping tools

---

## License

MIT License

---

## Contributing

Feel free to open issues or submit pull requests!

