# LearnGauge-edu-ai 🎓🤖

An **AI-powered academic learning platform** built as our graduation project.  
The system integrates **LLMs** and **Facial Expression Recognition (FER)** to enhance the learning experience for students and instructors.

---




## 🚀 Features

### 🎓 User Roles
- **Admin**: Manages the whole platform, courses, and users.  
- **Instructor**: Uploads lectures, monitors students, and receives feedback.  
- **Student**: Attends lectures, interacts with AI, and receives personalized learning support.  

### 💡 AI-Powered Tools
- **Lecture Question Generator**: Automatically creates questions from lecture content.  
- **Instructor-like Chatbot**: Answers student questions as if it were the instructor.  
- **Academic Chatbot Assistant**: Specialized for academic queries only.  

### 🎥 Facial Expression Recognition (FER)
- Analyzes student expressions every **15 seconds** during the lecture.  
- Detects states like *happy, bored, confused, frustrated...*  
- Generates reports for instructors to adapt teaching methods.  

---

## 🛠️ Tech Stack

**Frontend**  
- React.js  
- TailwindCSS  

**Backend**  
- Node.js  
- Express.js  

**AI Integration**  
- LLMs (Gemini)  

---

## 📂 Project Structure

# LearnGauge-edu-ai

## Project Structure

```
LearnGauge-edu-ai/
│
├── ui/                    # Frontend (React + TailwindCSS)
│   ├── public/
│   ├── src/
│   └── package.json
│
├── api/                   # Backend (Node.js + Express)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## Directory Overview

### `/ui` - Frontend
- **Framework**: React with TailwindCSS
- **Purpose**: User interface and client-side functionality
- **Structure**:
  - `public/` - Static assets
  - `src/` - React components and source code
  - `package.json` - Frontend dependencies

### `/api` - Backend
- **Framework**: Node.js with Express
- **Purpose**: Server-side API and business logic
- **Structure**:
  - `controllers/` - Request handlers and business logic
  - `models/` - Data models and database schemas
  - `routes/` - API route definitions
  - `utils/` - Helper functions and utilities
  - `server.js` - Main server entry point
  - `package.json` - Backend dependencies


---

## ⚙️ Getting Started

Clone the repository:

```bash
git clone https://github.com/MohamedMassoud10/LearnGauge-edu-ai.git
```
## 📌 Frontend Setup
cd LearnGauge-edu-ai/ui
npm install
npm start
## 📌 Backend Setup 
cd edu-vision/api
npm install
npm start

##  Environment Configuration

You must create and configure a config.env file inside the /api directory.

## 📖 Documentation & Links

- 🔗 [[LinkedIn Project Post](https://www.linkedin.com/posts/mohamed-one_%D8%AA%D9%83%D9%85%D9%84%D9%87-%D9%84%D8%A8%D9%88%D8%B3%D8%AA-%D8%AA%D8%AE%D8%B1%D8%AC%D9%8A-%D8%A7%D9%84%D8%AD%D9%85%D8%AF-%D9%84%D9%84%D9%87-%D9%81%D8%AE%D9%88%D8%B1-%D8%AC%D8%AF%D8%A7-%D8%A8%D9%85%D8%B4%D8%A7%D8%B1%D9%83%D8%AA%D9%8A-activity-7346308826515537921-FQUz?utm_source=share&utm_medium=member_desktop&rcm=ACoAADnIeWEBLYAiEE5AMUbioB1CtAWvpenteww)](#)  
- 📚 [[API Documentation](https://documenter.getpostman.com/view/28288286/2sAYXEEdnS)](#)  

## 🙌 Acknowledgments
A huge thanks to my amazing teammates — proud to have worked with you all ❤️  
This project was an incredible journey and a milestone in our learning path.
