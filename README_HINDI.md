# TaskFlow – Full Stack Task Manager

**Frontend + Backend + SQLite Database** वाला पूरा project। Database file अपने-आप बनती है और tasks उसमें save रहते हैं।

## चलाने के लिए

1. ZIP extract करें।
2. `taskflow-fullstack` folder को VS Code में खोलें।
3. VS Code Terminal में चलाएँ:

```bash
npm install
npm run dev
```

4. Frontend खोलें: http://localhost:5173
5. Backend API: http://localhost:5000/api/tasks

पहली बार `npm install` में internet connection चाहिए। उसके बाद हर बार केवल `npm run dev` चलाएँ।

## Features

- Dashboard पर total, pending और completed tasks
- नया task add करना
- Task edit करना
- Task complete / pending करना
- Task delete करना
- Search और status filter
- Responsive layout
- SQLite database में permanent storage
- Sample tasks पहली बार database बनने पर अपने-आप add होते हैं

## Database

SQLite database `server/data/taskflow.sqlite` में अपने-आप create होती है। कोई MongoDB account, password या `.env` setup नहीं चाहिए। Database file पहली बार backend start होने पर बनेगी।

## API Endpoints

| Method | Endpoint | काम |
|---|---|---|
| GET | `/api/tasks` | सभी tasks |
| POST | `/api/tasks` | नया task |
| PUT | `/api/tasks/:id` | task update |
| DELETE | `/api/tasks/:id` | task delete |

## Resume में project ऐसे लिखें

**TaskFlow – Full Stack Task Management Application**  
Built a responsive task management application using React.js, Node.js, Express.js and SQLite. Implemented REST APIs and CRUD operations to create, update, complete, search and delete tasks with persistent database storage.

## Tech Stack

React.js, Vite, JavaScript, Node.js, Express.js, SQLite, REST API, CSS

यह एक portfolio/demo project है। इसे अपने resume में डालने से पहले खुद चलाकर features समझें और अपने काम के अनुसार ही skills/claims लिखें।
