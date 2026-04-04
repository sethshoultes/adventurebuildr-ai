# AdventureBuildr AI

AI-first interactive storytelling platform. Describe a premise, watch AI generate a complete branching story graph on a visual canvas. Edit, extend, and refine with a split-pane editor. Readers experience stories through a cinematic player with typewriter text and animated choices.

Built on the conceptual model from the [AdventureBuildr WordPress plugin](https://github.com/sethshoultes/cyoa-interactive-story-builder) (DAG of episode nodes, world bible entities, per-user progress) but rebuilt from scratch with AI as the primary authoring tool.

## Screenshots

<!-- TODO: Add screenshots -->
<!-- ![Dashboard](docs/screenshots/dashboard.png) -->
<!-- ![Story Canvas](docs/screenshots/canvas.png) -->
<!-- ![Episode Editor](docs/screenshots/editor.png) -->
<!-- ![Story Reader](docs/screenshots/reader.png) -->

## Features

- **AI Story Generator** -- Describe genre, tone, protagonist, and conflict. AI generates a complete branching narrative with episodes, choices, and state variables.
- **Visual Story Canvas** -- ReactFlow-based graph editor. Nodes are episodes, edges are choices. Drag, connect, and rearrange with auto-layout via dagre.
- **Split-Pane Editor** -- Click any node to open a Tiptap rich text editor alongside the canvas. Edit prose while seeing the full story structure.
- **Cinematic Reader** -- Full-screen immersive experience with typewriter text animation, progress tracking, and animated choice cards. Mobile-first.
- **World Bible** -- 9 entity types (Character, Location, Item, Lore, Organization, Technology, Law, Vehicle, Weapon). AI generates full profiles from a one-sentence description.
- **State Variables** -- Custom variables (number, boolean, string) with choice consequences and conditional paths.
- **AI Episode Generation** -- Generate individual episode content that respects the world bible, story outline, and incoming/outgoing choices.
- **Reader Progress** -- Per-user, per-story progress tracking with choice history and state persistence.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) + TypeScript |
| UI | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix primitives) |
| Story Canvas | [ReactFlow](https://reactflow.dev/) + [dagre](https://github.com/dagrejs/dagre) (auto-layout) |
| Rich Editor | [Tiptap](https://tiptap.dev/) (ProseMirror-based) |
| Auth | [Clerk](https://clerk.com/) |
| Database | [Neon](https://neon.tech/) (PostgreSQL) + [Prisma](https://www.prisma.io/) ORM |
| AI | [Vercel AI SDK](https://sdk.vercel.ai/) + [Anthropic Claude](https://www.anthropic.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Validation | [Zod](https://zod.dev/) |
| Deployment | [Vercel](https://vercel.com/) |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech/) PostgreSQL database (or any PostgreSQL instance)
- A [Clerk](https://clerk.com/) application
- An [Anthropic](https://console.anthropic.com/) API key

### Installation

```bash
git clone https://github.com/sethshoultes/adventurebuildr-ai.git
cd adventurebuildr-ai
npm install
```

### Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in route (default: `/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up route (default: `/sign-up`) |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `NEXT_PUBLIC_APP_URL` | App URL (default: `http://localhost:3000`) |

### Database Setup

```bash
npx prisma migrate dev
```

Or push the schema directly:

```bash
npx prisma db push
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    (auth)/                    # Clerk sign-in/sign-up pages
    api/
      reader/[slug]/           # Public reader API (story data + progress)
      stories/                 # Story CRUD
      stories/[storyId]/
        episodes/              # Episode CRUD
        choices/               # Choice CRUD
        entities/              # World bible entity CRUD
        state-variables/       # State variable management
        generate/
          outline/             # AI: Generate full story outline
          episode/[episodeId]/ # AI: Generate episode content
          entity/              # AI: Generate entity profile
      webhooks/clerk/          # Clerk user sync webhook
    dashboard/                 # Story listing + create
    editor/[storyId]/          # Canvas + split-pane editor
    reader/[slug]/             # Cinematic story reader
  components/
    canvas/                    # ReactFlow canvas, toolbar, nodes, edges
    dashboard/                 # Story cards, create button
    editor/                    # Tiptap episode editor, split pane
    providers/                 # Story context provider
    reader/                    # Typewriter text, choice cards, progress bar
    ui/                        # shadcn/ui primitives
    world-bible/               # Entity form and list
  lib/
    ai/
      generate-story.ts        # Zod schemas, cost estimation
      prompt-builder.ts        # Prompt templates for outline, episode, entity
    db.ts                      # Prisma client singleton
    utils.ts                   # Utility functions
  middleware.ts                # Clerk auth middleware
  types/
    story.ts                   # TypeScript type definitions
prisma/
  schema.prisma                # Database schema (14 models)
```

## API Routes

### Stories

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/stories` | List stories for authenticated user |
| POST | `/api/stories` | Create a new story |
| GET | `/api/stories/[storyId]` | Get story with episodes, choices, entities |
| PATCH | `/api/stories/[storyId]` | Update story metadata |
| DELETE | `/api/stories/[storyId]` | Delete story and all related data |

### Episodes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/stories/[storyId]/episodes` | List episodes for a story |
| POST | `/api/stories/[storyId]/episodes` | Create an episode |
| PATCH | `/api/stories/[storyId]/episodes/[episodeId]` | Update episode content/position |
| DELETE | `/api/stories/[storyId]/episodes/[episodeId]` | Delete an episode |

### Choices

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/stories/[storyId]/choices` | Create a choice (edge) |
| DELETE | `/api/stories/[storyId]/choices/[choiceId]` | Delete a choice |

### World Bible

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/stories/[storyId]/entities` | List entities |
| POST | `/api/stories/[storyId]/entities` | Create an entity |
| PATCH | `/api/stories/[storyId]/entities/[entityId]` | Update entity |
| DELETE | `/api/stories/[storyId]/entities/[entityId]` | Delete entity |

### AI Generation

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/stories/[storyId]/generate/outline` | Generate full story outline from premise |
| POST | `/api/stories/[storyId]/generate/episode/[episodeId]` | Generate episode content |
| POST | `/api/stories/[storyId]/generate/entity` | Generate entity profile |

### Reader

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/reader/[slug]` | Get published story for reader |
| POST | `/api/reader/[slug]/progress` | Save/update reader progress |

## AI Generation Pipeline

The AI system uses Anthropic Claude via the Vercel AI SDK with structured output (Zod schemas).

### Outline Generation

1. Author provides genre, tone, protagonist, conflict, and target depth.
2. `prompt-builder.ts` constructs a system prompt with world bible constraints and structural requirements (valid DAG, 2-4 choices per node, distinct endings).
3. Claude generates a complete story graph as structured JSON matching `OutlineSchema` (nodes, edges, state variables).
4. The API creates all episodes, choices, and state variables in a single transaction.
5. Token usage and cost are logged to `AIGeneration`.

### Episode Content Generation

1. `prompt-builder.ts` builds a prompt with the full story outline context, incoming/outgoing choice labels, and world bible entities.
2. Claude generates 150-400 words of second-person prose as HTML.
3. Content is saved to the episode and the canvas updates in real time.

### Entity Generation

1. Author provides a name, type, and brief description.
2. Claude generates a full profile with structured attributes appropriate to the entity type.
3. The entity is added to the world bible and available as context for future generations.

## Database Schema

14 Prisma models covering the full interactive fiction domain:

- **User** -- Synced from Clerk, tracks plan tier and token budget
- **Story** -- Top-level container with genre, tone, status, and world bible
- **Episode** -- Nodes in the story graph with rich text content and canvas position
- **Choice** -- Directed edges between episodes with labels, conditions, and consequences
- **Entity** -- World bible entries (9 types) with structured attributes
- **EpisodeEntity** -- Many-to-many linking episodes to entities with roles
- **Universe** -- Parallel storylines within a story
- **Storyline** -- Named narrative threads
- **StateVariable** -- Author-defined variables (number, boolean, string)
- **UserProgress** -- Per-user reading state with choice history
- **AIGeneration** -- Token usage and cost tracking per generation
- **StoryEvent** -- Analytics events (choice selections, story starts, completions)

## Deployment

### Vercel + Neon

1. Push to GitHub.
2. Import the repo in [Vercel](https://vercel.com/).
3. Add all environment variables from `.env.example`.
4. Vercel runs `prisma generate` automatically via the `postinstall` script.
5. Run `prisma migrate deploy` against your Neon database (or use `prisma db push`).
6. Set up a [Clerk webhook](https://clerk.com/docs/integrations/webhooks) pointing to `https://your-domain.com/api/webhooks/clerk`.

### Custom Domain

Point `adventurebuildr.com` to your Vercel deployment via DNS.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Make your changes and ensure `npm run lint` passes.
4. Commit with a descriptive message.
5. Push and open a pull request.

Please follow the existing code style (TypeScript strict, Tailwind for styling, Zod for validation).

## License

[MIT](LICENSE)
