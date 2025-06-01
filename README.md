Here’s your updated `README.md` file with **clear and complete setup instructions** for both the backend and frontend based on your logs:

---

# 🩺 Medical Diagnosis AI Chatbot

A full-stack AI-powered medical assistant with a chat interface inspired by ChatGPT. It uses a RoBERTa model for medical diagnosis (coming soon) and features a modern UI built with Vue.js and Tailwind CSS.

---

## 🚀 Features

- ✅ Sign-Up / Sign-In (JWT-based auth)
- 💬 ChatGPT-style interface
- 🌓 Dark / Light mode toggle
- 📱 Responsive UI with Tailwind CSS
- 🔐 Token-based secure API integration (via Django REST + SimpleJWT)
- 🧠 Medical AI model integration with Hugging Face (coming soon)

---

## 📂 Project Structure

```

Graduation-Project-1/
├── medical-assistant-backend/     # Django backend with DRF
├── medical-assistant-frontend/    # Vue 3 frontend with Vite

````

---

## ⚙️ Backend Setup (Django REST Framework)

1. Navigate to the backend folder:

   ```bash
   cd medical-assistant-backend
   ```
2. Create and activate a virtual environment:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Apply migrations:

   ```bash
   python manage.py migrate
   ```

5. Create a superuser:

   ```bash
   python manage.py createsuperuser
   ```

6. Run the development server (use a free port like 8002):

   ```bash
   python manage.py runserver 8002
   ```

7. Admin Panel available at:

   ```
   http://localhost:8002/admin/
   ```

---

## 💻 Frontend Setup (Vue + Vite + Tailwind)

1. Navigate to the frontend directory:

   ```bash
   cd medical-assistant-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the app:

   ```
   http://localhost:5173/
   ```

> ℹ️ Port 5173 is used by default. If busy, Vite will pick a different one (e.g., 5174).

---

## 🧪 Development Notes

* Vue frontend uses **`/chat`**, **`/signin`**, and **`/signup`** routes.
* All API requests point to `http://localhost:8002/api/` by default.
* Chat functionality will use a local `.safetensors` model when deployed (see next section).

---

## 🧠 Model Integration (WIP)

The backend will use a RoBERTa model via the Hugging Face Transformers pipeline with `.safetensors` weights stored locally in:

```
medical-assistant-backend/model/model.safetensors
```

Due to GitHub size limits, this file **is not committed**. You can manually download or share it via:

* Google Drive
* Hugging Face
* Dropbox
* S3

---

## 📌 Requirements

* Python 3.12+
* Node.js 18+
* npm 9+
* Git LFS (for model tracking)
* CUDA 12.6+ for GPU acceleration (optional)

---

## 🛠️ Technologies Used

* **Backend**: Django 5.2.1, Django REST Framework, SimpleJWT, Djoser, HuggingFace Transformers
* **Frontend**: Vue 3, Vite, Tailwind CSS, Axios
* **Model**: RoBERTa with `.safetensors` (Hugging Face)
* **Authentication**: JWT, Djoser, Social Auth (optional)

---

## ✨ Author

Developed by Zeyad Mohamed & Nureddin Soltan

---

```

---

Let me know if you'd like to:
- Add screenshots
- Deploy to Vercel/Render
- Automate model loading from Hugging Face or Drive
- Setup environment variables for API keys

I'll walk you through any of that!
```
