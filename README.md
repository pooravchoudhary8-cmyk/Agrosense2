# Smart Irrigation System

This repository contains the frontend and backend for the Smart Irrigation System project. The goal of the system is to provide intelligent watering recommendations based on environmental and soil data, with user authentication and various utilities.

## Repository Structure

- `frontend/` – client application code built with a modern JavaScript framework.
- `backend/` – server code, services, controllers, models, and utilities written in Node.js.

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/pooravchoudhary8-cmyk/Agrosense.git
   cd Agrosense
   ```

2. **Install dependencies**
   - Backend:
     ```bash
     cd backend
     npm install
     ```
   - Frontend:
     ```bash
     cd ../frontend
     npm install
     ```

3. **Environment Variables**
   Create a `.env` file in the backend folder with the following values:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   JWT_SECRET=your_jwt_secret
   MONGO_URI=your_mongodb_connection_string
   ```

4. **Run**
   - Backend:
     ```bash
     npm run dev
     ```
   - Frontend:
     ```bash
     npm run dev
     ```

## Features

- Google OAuth2 based authentication
- Anomaly detection and irrigation recommendations
- Modular services and API structure

## License

This project is licensed under the MIT License.
