# Cards Game

A full-stack (MERN) web application for creating, managing, and studying word lists using flashcards.

## Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
* Node.js
* MongoDB (Atlas or Local)

### Installation

1. **Clone the repository** (if applicable) or download the source code.
2. **Setup Server:**
   ```bash
   cd server
   npm install
   ```
3. **Setup Client:**
   ```bash
   cd client
   npm install
   ```

### Environment Variables
You need to create `.env` files in both the `server` and `client` directories.

**In `server/.env`:**
```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
ADMIN_PASSWORD=your_secret_password
```

**In `client/.env`:**
```env
VITE_API_URL=http://localhost:3001
```

## Running the Application

You need to run both the server and the client in separate terminal windows.

**Terminal 1 (Backend - Server):**
```bash
cd server
npm start
# or use nodemon for development: nodemon server.js
```

**Terminal 2 (Frontend - Client):**
```bash
cd client
npm run dev
```

## Bulk Adding Words using AI

To add multiple words at once to a new list, you can use an AI tool (like ChatGPT, Gemini, or Claude) to format your raw text into the required JSON structure. 

### 1. The Prompt
Copy the following prompt and paste it into your AI tool, followed by your raw list of words:

```text
Please convert the following list of words and their translations into a JSON array of objects. Ignore the category titles (like Nouns, Verbs). Each object should have exactly two keys: 'front' for the English word, and 'back' for the Hebrew translation. Output ONLY the valid JSON array, without any markdown formatting or extra text. Here is the list:
```

### 2. Expected Output Format
The AI should return a clean JSON array that looks exactly like this. You can then paste this directly into the bulk creation modal in the application:

```json
[
  { "front": "Accomplishment", "back": "הישג" },
  { "front": "Aid", "back": "סיוע / עזרה" },
  { "front": "Equivalent", "back": "שווה ערך / מקביל" }
]
```