# Vertinova Frontend

Frontend aplikasi Vertinova Finance menggunakan React + Vite.

🌐 **Production:** https://vertinova.id

## Requirements

- Node.js 18 atau lebih tinggi
- NPM atau Yarn

## Installation (Development)

1. Clone repository ini:
```bash
git clone https://github.com/Hawsyi-CEO/vertinova-frontend.git
cd vertinova-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment:
```bash
cp .env.example .env
```

4. Konfigurasi API URL di file `.env`:
```env
VITE_API_URL=http://localhost:8000
```

5. Jalankan development server:
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## Build untuk Production

### Windows

```bash
.\build-production.bat
```

### Linux/Mac

```bash
chmod +x build-production.sh
./build-production.sh
```

Atau manual:

```bash
npm run build
```

File hasil build akan ada di folder `dist/`

## Preview Production Build

```bash
npm run preview
```

## Deployment

Lihat [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) untuk panduan lengkap deployment ke production.

### Quick Deploy

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build for production
npm run build

# Nginx akan otomatis serve dari folder dist/
```

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

## Folder Structure

```
src/
├── assets/         # Static assets (images, fonts, etc)
├── components/     # Reusable components
├── context/        # React Context (Auth, etc)
├── pages/          # Page components
├── services/       # API services
├── App.jsx         # Main App component
└── main.jsx        # Entry point
```

## License

MIT
