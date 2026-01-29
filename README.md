# Mi Famoso Libro Verde

A beautiful bilingual (Spanish/English) recipe book mobile app built with React Native, Expo, and Supabase.

## Features

- View recipes in a beautiful green-themed UI
- Search and filter recipes by category
- View detailed recipe information with ingredients and steps
- Create, edit, and delete your own recipes
- Save favorite recipes
- Bilingual support (Spanish/English) with language toggle
- Optional authentication with Supabase (email/password or magic link)
- Works offline with demo data when Supabase is not configured

## Screenshots

The app features a modern, green-themed design with:
- Home screen with recipe grid
- Recipe details with ingredients checklist
- Create/Edit recipe forms
- Favorites list
- Settings with language selection

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase (Auth + PostgreSQL Database)
- **i18n**: i18next + react-i18next
- **State**: React Context + Hooks

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mi-libro-verde
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional - app works without Supabase)
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Set up Supabase** (optional)
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema: `supabase/schema.sql`
   - Run the seed data: `supabase/seed.sql`
   - Copy your project URL and anon key to `.env`

5. **Start the app**
   ```bash
   npm start
   # or
   npx expo start
   ```

6. **Run on device**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `a` for Android emulator, `i` for iOS simulator

## Project Structure

```
mi-libro-verde/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Home / Recipe List
│   │   ├── favorites.tsx    # Favorites
│   │   ├── explore.tsx      # Explore by difficulty
│   │   └── settings.tsx     # Settings
│   ├── recipe/
│   │   ├── [id].tsx         # Recipe Detail
│   │   ├── create.tsx       # Create Recipe
│   │   └── edit/[id].tsx    # Edit Recipe
│   ├── auth.tsx             # Authentication
│   └── _layout.tsx          # Root layout with providers
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React Context providers
│   ├── i18n/               # Translation files
│   ├── lib/                # Supabase client, constants
│   ├── services/           # API services
│   └── types/              # TypeScript types
├── supabase/
│   ├── schema.sql          # Database schema + RLS
│   └── seed.sql            # Sample recipe data
└── assets/                 # Images and fonts
```

## Database Schema

### Recipes Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner (null for public recipes) |
| title_es | text | Spanish title |
| title_en | text | English title |
| description_es | text | Spanish description |
| description_en | text | English description |
| ingredients_es | jsonb | Spanish ingredients array |
| ingredients_en | jsonb | English ingredients array |
| steps_es | jsonb | Spanish steps array |
| steps_en | jsonb | English steps array |
| image_url | text | Recipe image URL |
| tags | jsonb | Tags array |
| prep_time_minutes | int | Preparation time |
| servings | int | Number of servings |
| difficulty | text | easy/medium/hard |
| category | text | breakfast/lunch/dinner/etc |
| created_at | timestamp | Creation date |

### Favorites Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User who favorited |
| recipe_id | uuid | Favorited recipe |
| created_at | timestamp | When favorited |

### Row Level Security (RLS)

- **Recipes**: Public read for recipes where `user_id IS NULL`
- **Recipes**: Owners can CRUD their own recipes
- **Favorites**: Users can only access their own favorites

## i18n (Internationalization)

The app supports Spanish (es) and English (en):

- Translation files: `src/i18n/es.json` and `src/i18n/en.json`
- Language toggle in header
- Language preference persisted with AsyncStorage
- Recipe content changes based on language (title_es/title_en, etc.)
- Fallback to other language if translation missing

## Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run lint       # Run ESLint
```

## Demo Mode

If Supabase is not configured, the app runs in demo mode with:
- 6 sample recipes pre-loaded
- Local favorites (in-memory)
- Full CRUD operations (in-memory)
- All UI features functional

This allows you to test the app without setting up a backend.

## Customization

### Colors
Edit `src/lib/constants.ts` to customize the green color palette:
```typescript
export const Colors = {
  light: {
    primary: '#22C55E',      // Main green
    primaryLight: '#86EFAC',
    primaryDark: '#16A34A',
    // ...
  },
  // ...
};
```

### Adding Translations
1. Add keys to both `src/i18n/en.json` and `src/i18n/es.json`
2. Use in components: `const { t } = useTranslation(); t('key.path')`

### Adding New Categories
Edit `src/lib/constants.ts`:
```typescript
export const CATEGORIES: { value: Category; labelKey: string }[] = [
  { value: 'all', labelKey: 'categories.all' },
  // Add new categories here
];
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own recipe apps!

---

Built with React Native, Expo, and Supabase
