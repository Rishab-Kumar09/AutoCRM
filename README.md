# AutoCRM

A modern customer support ticketing system built with React and Supabase.

## Features

- Multi-tenant support system
- Role-based access control (Company Admin, Agent, Customer)
- Real-time ticket management
- Agent invitation system
- Customer support portal
- Ticket tracking and management
- Modern, responsive UI

## Tech Stack

- React
- Vite
- Supabase (Authentication & Database)
- React Router
- CSS Modules

## Getting Started

1. Clone the repository
```bash
git clone [your-repo-url]
cd AutoCRM
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

## Project Structure

- `/src/components` - Reusable UI components
- `/src/contexts` - React context providers
- `/src/lib` - Utility functions and API clients
- `/src/pages` - Page components
  - `/auth` - Authentication pages
  - `/public` - Public pages
  - `/customer` - Customer dashboard and ticket management
  - `/agent` - Agent dashboard and ticket handling
  - `/company` - Company admin dashboard and settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
