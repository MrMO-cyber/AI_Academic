
# AcademiaSmart - Smart Academic Management System

AcademiaSmart is a high-performance, AI-driven platform designed to streamline student workflows. By leveraging the **Gemini 3** series models, it transforms unstructured academic data (like PDF schedules and lecture notes) into actionable digital tools.

## 🚀 Key Features

### 1. Smart Schedule Ingestion
- **PDF-to-Calendar**: Upload a messy PDF schedule, and the system uses `gemini-3-pro-preview` to extract course names, days, times, and locations.
- **Conflict Detection**: The AI automatically identifies overlapping classes during the parsing phase and flags them for manual review.
- **Manual Validation**: A "Draft" stage allows users to verify or edit extracted data before saving it to the permanent local schedule.

### 2. Intelligent Study Hub
- **Executive Summarization**: Upload study materials (PDFs, PPTs, or images). The system generates an immediate breakdown of Core Objectives, Key Results, and Simplified Explanations.
- **Contextual Chatbot**: Ask follow-up questions about your documents. The chatbot uses the uploaded material as context, ensuring answers are grounded in your specific study content.
- **Multi-Format Support**: Supports PDFs and standard image formats (PNG/JPG) for visual notes.

### 3. Automated Academic Calendar
- **Weekly Grid**: A clean, responsive calendar view that visualizes your weekly load.
- **15-Minute Alerts**: Browser-based notifications trigger 15 minutes before every lecture, providing the subject name and room number automatically.

## 🛠 Tech Stack

- **Frontend**: React (v19), TypeScript, Tailwind CSS.
- **Icons**: Lucide React.
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`).
  - `gemini-3-pro-preview`: Used for complex extraction and multi-turn contextual chat.
  - `gemini-3-flash-preview`: Used for rapid document summarization.
- **Storage**: Browser `localStorage` for persistent offline data.
- **Notifications**: Native Browser Notification API.

## 📖 How to Use

1. **Setup Schedule**: Go to the **My Calendar** tab. Upload your university's PDF schedule. Review the extracted classes in the "Draft" list and click "Save Schedule".
2. **Study Materials**: In the **Study Materials** tab, upload a lecture slide or textbook chapter. Wait for the AI to generate a summary.
3. **Chat**: Click on any material to open the summary. Use the **Academia Bot** on the right to ask specific questions like "What are the main formulas on page 3?" or "Explain the conclusion in simple terms."
4. **Notifications**: Ensure you click "Enable Alerts" in the sidebar to receive pre-class reminders.

## 🔒 Privacy & Local First
All your schedule data and materials are stored locally in your browser's storage. AI processing is performed via secure API calls to Gemini models, providing a private, responsive experience without a complex backend.
