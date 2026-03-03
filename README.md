# 🚀 IlhanFlow — Team Task Tracker

**IlhanFlow** is a modern, high-performance task management application designed for teams. Built with a focus on speed, aesthetics, and real-time collaboration.

![Dashboard Preview](https://via.placeholder.com/800x450?text=IlhanFlow+Dashboard)

## ✨ Features

- **📊 Dynamic Dashboard**: Real-time statistics, task distribution charts (Recharts), and recent activity tracking.
- **📋 Kanban Board**: Interactive drag-and-drop task management powered by `@hello-pangea/dnd`.
- **🛡️ Secure Authentication**: Robust login and registration system using **Firebase Authentication**.
- **👥 Project Collaboration**: Invite team members using their unique **User ID (UID)**.
- **↔️ Resizable Sidebar**: Fully adjustable navigation panel with persistence across sessions.
- **🌗 Smart Themes**: Premium Dark and Light modes with custom animations (Midnight Aurora & Starfield).
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile devices.
- **⚡ Performance Insights**: Integrated with Vercel Analytics and Speed Insights.

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database & Auth**: [Firebase](https://firebase.google.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS (Custom Variable System)
- **Charts**: [Recharts](https://recharts.org/)

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/l4poshk/task-flow.git
   cd task-flow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🏗️ Building for Production

To create an optimized production build:

```bash
npm run build
```

The output will be in the `dist/` folder, ready for deployment.

---

Designed and developed by **Ilhan**.
