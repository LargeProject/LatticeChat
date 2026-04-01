# @latticechat/shared

Shared types, contracts, and utilities for LatticeChat applications.

## Installation

The package is automatically available as a workspace dependency in all apps.

## Usage

### Import from web app

```typescript
// In web/src/...
import { sendMessage, type SendMessage } from '@latticechat/shared/contracts/websocket';

const messageSchema = sendMessage;
```

### Import from server app

```typescript
// In server/src/...
import { sendMessage, type SendMessage } from '@latticechat/shared/contracts/websocket';

// Use in routes, validation, etc.
const validated = messageSchema.parse(incomingData);
```

## Exports

### `@latticechat/shared/contracts/websocket`

- `sendMessage` - Zod schema for websocket send message contracts
- `SendMessage` - TypeScript type inferred from sendMessage schema
- `actions` - Websocket actions object

## Building

The shared package is built automatically during installation. To manually rebuild:

```bash
cd packages/shared
yarn build
```

Output goes to `dist/` directory, which is referenced in the package exports.
