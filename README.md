# MERN Flow Builder Application

A full-stack application that allows users to create, manage, and visualize flowcharts. Built with the MERN stack (MongoDB, Express, React, Node.js) and React Flow.

## Features

- **User Authentication**: Secure Sign Up and Login functionality using JWT.
- **Flow Management**: Create, save, and delete flowcharts.
- **Interactive Flow Builder**: Drag-and-drop interface using React Flow.
- **Admin Dashboard**: Admin users can view and manage all flows in the system.
- **Responsive Design**: Modern UI built with Tailwind CSS and Framer Motion.
- **Docker Support**: Containerized backend for easy deployment.

## Tech Stack

### Client
- **React**: Frontend library for building user interfaces.
- **Vite**: Fast build tool and development server.
- **React Flow**: Library for building node-based applications.
- **Tailwind CSS**: Utility-first CSS framework.
- **Framer Motion**: Animation library for React.
- **Axios**: Promise-based HTTP client.

### Server
- **Node.js**: JavaScript runtime environment.
- **Express**: Web application framework for Node.js.
- **MongoDB**: NoSQL database for storing user and flow data.
- **Mongoose**: ODM library for MongoDB and Node.js.
- **JWT**: JSON Web Tokens for secure authentication.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas connection string)
- Docker (Optional, for containerization)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd assignments
```

### 2. Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory based on `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flowbuilder
JWT_SECRET=your_jwt_secret_key_here
```

Start the server:

```bash
npm run dev
```

The server will run on `http://localhost:5000`.

### 3. Frontend Setup

Navigate to the client directory and install dependencies:

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The client will run on `http://localhost:5173`.

## Docker Setup (Backend)

To run the backend using Docker:

1. Build the Docker image:
   ```bash
   cd server
   docker build -t flow-builder-server .
   ```

2. Run the container:
   ```bash
   docker run -p 5000:5000 --env-file .env flow-builder-server
   ```

## Usage

1. **Register**: Create a new account.
2. **Login**: Log in with your credentials.
3. **Create Flow**: Use the "Create New Flow" button to start a new project.
4. **Edit Flow**: Drag nodes, connect edges, and save your work.
5. **Admin Access**: 
   - Default Admin Credentials (if seeded):
     - Email: `admin`
     - Password: `admin123`
   - Admins can see a "Delete" button on flow cards to manage content.

## Deployment

### Backend (Render/Heroku)
- The backend includes a `Dockerfile` for deployment on platforms like Render.
- Ensure environment variables (`MONGODB_URI`, `JWT_SECRET`) are set in the deployment dashboard.

### Frontend (Vercel/Netlify)
- Deploy the `client` directory.
- Set the `VITE_API_URL` environment variable to your deployed backend URL.

## License

This project is open source and available under the [MIT License](LICENSE).
