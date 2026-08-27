# How to Run the Portfolio Application

This guide explains how to start the backend and frontend for the portfolio application. You will need to open **two separate terminal windows** to run both at the same time.

## 1. Start the Backend

1. Open your first terminal or command prompt.
2. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
   *(Or full path: `cd c:\Users\nanth\OneDrive\Desktop\PORTFOLIO\backend`)*
3. Install the required Node.js packages (you only need to do this the very first time):
   ```bash
   npm install
   ```
4. **Important**: Make sure your database (e.g., MySQL) is running and your `.env` file is properly configured with your database credentials.
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *(Keep this terminal open and running in the background).*

---

## 2. Start the Frontend

1. Open a **new, separate** terminal window.
2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
   *(Or full path: `cd c:\Users\nanth\OneDrive\Desktop\PORTFOLIO\frontend`)*
3. Install the required Node.js packages (you only need to do this the very first time):
   ```bash
   npm install
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Vite will give you a local URL (usually `http://localhost:5173`). Open that URL in your web browser to view your portfolio!

---

**Note**: To stop either server, simply go to its terminal window and press `Ctrl + C`.
