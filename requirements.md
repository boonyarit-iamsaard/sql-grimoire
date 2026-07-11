# SQL RPG Prototype Requirements

## 1. Product Goal

Build a small browser-based SQL learning game that feels like an RPG while remaining a standard web application.

The prototype should validate whether developers enjoy solving SQL challenges inside a narrative world and want to continue to another mission.

## 2. Target User

A working developer who:

- Uses SQL regularly
- Understands basic queries and joins
- Wants more structured practice
- Prefers realistic business problems over isolated syntax exercises

## 3. Prototype Scope

The prototype contains one complete mission:

> **The Missing Shipment**

The player helps a merchant investigate delayed shipments by querying an embedded database.

The complete experience should take approximately 10-15 minutes.

## 4. Core User Flow

1. Player opens the landing page.
2. Player starts the game.
3. Player sees a simple illustrated world map.
4. Player selects the Merchant Guild location.
5. An NPC presents the mission through dialogue.
6. Player opens the SQL workbench.
7. Player inspects the available tables.
8. Player writes and runs a SQL query.
9. Query results appear in a table.
10. Player submits the result.
11. The system evaluates the query output.
12. Player receives feedback, XP, and a story conclusion.
13. The completed mission appears in the player journal.

## 5. Screens

### 5.1 Landing Page

Include:

- Game title
- One-sentence premise
- Start Game button
- Continue button when saved progress exists

### 5.2 World Map

Include:

- One illustrated map image
- One clickable location: Merchant Guild
- One locked future location
- Player XP display
- Visual completed state for the Merchant Guild

The map does not require player movement, tile maps, collision detection, or a game engine.

### 5.3 Mission Briefing

Include:

- NPC portrait
- NPC name
- Sequential dialogue lines
- Mission objective
- Begin Investigation button

Example objective:

> Find all delayed orders and return the order ID, customer name, and shipment status.

### 5.4 SQL Workbench

Include:

- Mission objective
- Schema explorer
- SQL editor
- Run Query button
- Submit Answer button
- Reset Database button
- Hint button
- Query result table
- SQL error display

### 5.5 Mission Result

On failure, show:

- A useful feedback message
- Expected column names
- Whether rows or values are incorrect
- Option to return to the editor

On success, show:

- Story consequence
- XP earned
- Concept learned
- Player query
- Reference solution
- Technical explanation
- Return to Map button

### 5.6 Journal

Include:

- Completed mission
- SQL concept learned
- Player's submitted query
- Reference query
- Short explanation

## 6. Mission Content

### Mission Title

The Missing Shipment

### Story

A merchant reports that several customer shipments have not arrived. The player must inspect the guild database and identify delayed orders.

### Database Tables

```sql
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE shipments (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    shipped_at TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

### Required Result

The submitted query must return:

```text
order_id
customer_name
shipment_status
```

The expected rows should contain all shipments with a `delayed` status.

### SQL Concepts

- `SELECT`
- Table aliases
- `INNER JOIN`
- Filtering with `WHERE`
- Selecting columns from multiple tables

### Example Reference Query

```sql
SELECT
    o.id AS order_id,
    c.name AS customer_name,
    s.status AS shipment_status
FROM orders AS o
JOIN customers AS c
    ON c.id = o.customer_id
JOIN shipments AS s
    ON s.order_id = o.id
WHERE s.status = 'delayed';
```

## 7. Query Evaluation

The system must not compare SQL source code.

It should:

1. Execute the player query.
2. Execute the reference query.
3. Compare column names.
4. Compare normalized result rows.
5. Ignore row order unless the mission explicitly requires ordering.
6. Preserve duplicate-row semantics.
7. handle `NULL` values consistently.
8. Return a structured pass or failure result.

Suggested result shape:

```ts
type EvaluationResult =
  | {
      passed: true;
      earnedXp: number;
    }
  | {
      passed: false;
      reason: "SQL_ERROR" | "INCORRECT_COLUMNS" | "INCORRECT_ROWS";
      message: string;
    };
```

## 8. RPG Presentation

The prototype should feel game-like through presentation rather than traditional game mechanics.

Include:

- Illustrated world map
- NPC portrait
- Dialogue box
- XP reward
- Mission unlock state
- Success sound
- Simple transition animations
- Story-based success message

Do not include:

- Character movement
- Combat
- Inventory
- Equipment
- Tile maps
- Collision detection
- Multiplayer
- Leaderboards
- Character customization
- Animated sprite sheets

## 9. Assets

Required assets:

```text
assets/
��� maps/
�   ��� world-map.webp
��� characters/
�   ��� merchant/
�       ��� neutral.webp
�       ��� worried.webp
�       ��� happy.webp
��� locations/
�   ��� merchant-guild.webp
�   ��� locked-location.webp
��� ui/
�   ��� dialogue-frame.webp
�   ��� xp-icon.svg
��� audio/
    ��� button-click.ogg
    ��� mission-complete.ogg
```

All external assets must have licenses that permit commercial web use.

Store asset attribution and license information in:

```text
ASSET-LICENSES.md
```

## 10. Technical Requirements

### Frontend

- React
- TypeScript
- Vite
- React Router
- CodeMirror or Monaco Editor
- CSS Modules, Tailwind CSS, or plain CSS

### SQL Runtime

Use an embedded browser database:

- SQLite compiled to WebAssembly, or
- `sql.js`

The database must:

- Initialize from schema and seed scripts
- Run entirely in the browser
- Reset to its original state
- Return query rows and SQL errors
- Never access the application's own persistent data

### Persistence

Use `localStorage` for:

- Completed mission IDs
- XP
- Last submitted query
- Journal entries
- Current mission state

No account system or backend is required.

## 11. Suggested Application Structure

```text
src/
��� app/
�   ��� router.tsx
�   ��� App.tsx
��� game/
�   ��� missions/
�   �   ��� missing-shipment.ts
�   ��� progress/
�   �   ��� progress-store.ts
�   �   ��� progress-types.ts
�   ��� dialogue/
�       ��� dialogue-types.ts
��� sql/
�   ��� sql-runtime.ts
�   ��� sqlite-runtime.ts
�   ��� evaluator.ts
�   ��� result-normalizer.ts
��� pages/
�   ��� LandingPage.tsx
�   ��� WorldMapPage.tsx
�   ��� MissionPage.tsx
�   ��� JournalPage.tsx
��� components/
�   ��� DialogueBox.tsx
�   ��� SchemaExplorer.tsx
�   ��� SqlEditor.tsx
�   ��� QueryResultTable.tsx
�   ��� MissionFeedback.tsx
��� assets/
```

## 12. Mission Data Model

```ts
type Mission = {
  id: string;
  title: string;
  locationId: string;
  objective: string;

  dialogue: Array<{
    speaker: string;
    portrait: string;
    text: string;
  }>;

  database: {
    schemaSql: string;
    seedSql: string;
  };

  challenge: {
    expectedColumns: string[];
    referenceQuery: string;
    hints: string[];
  };

  reward: {
    xp: number;
    successMessage: string;
  };

  explanation: {
    summary: string;
    concepts: string[];
    referenceSolution: string;
  };
};
```

## 13. Non-Functional Requirements

- The app must work on modern desktop browsers.
- Query execution should normally complete in under one second.
- Long-running queries should be interrupted or rejected.
- Progress should survive page refreshes.
- SQL errors should not crash the application.
- The database should reset without reloading the page.
- The SQL workbench should remain usable at a viewport width of 1024 pixels.
- Assets should be optimized for web delivery.
- Core game logic should remain separate from presentation components.

## 14. Out of Scope

The prototype will not include:

- Authentication
- Payments
- Backend API
- Cloud database
- PostgreSQL-specific features
- Multiple campaigns
- Administrative content editor
- AI-generated hints
- Social functionality
- Mobile application
- Phaser or another game engine
- User-generated missions

## 15. Acceptance Criteria

The prototype is complete when:

- A new player can start without instructions from the developer.
- The world map clearly shows the available mission.
- The NPC dialogue explains the problem.
- The player can inspect the schema.
- The player can write and execute SQL.
- Query results and SQL errors are displayed.
- Correct and incorrect submissions are distinguished reliably.
- A correct answer completes the mission.
- XP and progress are saved locally.
- The journal records the completed mission.
- Refreshing the browser preserves completion.
- The player can reset progress and replay the mission.
- The experience has a clear beginning, challenge, and ending.
