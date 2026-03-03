# Douala General Hospital Patient Feedback and Reminder System

## Features

1. **Multilingual Patient Feedback Interface**
   - Text input with voice recognition support (using Web Speech API)
   - Star rating system for easy feedback

2. **Automated Patient Reminder System**
   - SMS reminders via Twilio integration
   - Appointment and medication reminders

3. **Real-time Hospital Performance Dashboard**
   - Visual summary of patient feedback and metrics

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd /backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up Twilio environment variables:
   ```
   export TWILIO_ACCOUNT_SID="your_account_sid"
   export TWILIO_AUTH_TOKEN="your_auth_token"
   export TWILIO_PHONE_NUMBER="your_twilio_phone_number"
   ```

4. Run the backend server:
   ```
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd /Frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a .env file with your backend URL:
   ```
   VITE_BACKEND_URL=http://localhost:8000
   ```

4. Run the frontend development server:
   ```
   npm run dev
   ```
# DEPLOYMENT
Run full project at  [here](https://dgh-landing.netlify.app/)
| System Component               | Live Deployment Link                     |
|--------------------------------|-----------------------------------------|
| Patient Feedback System (Track 1) | [Launch Feedback Portal](https://cerulean-sundae-b9837e.netlify.app/) |
| LLM Chatbot (Track 2)          | [Access AI Assistant]( https://statuesque-bienenstitch-849638.netlify.app/) |
| Blood Bank System (Track 3)    | [View Blood Bank](https://ai-bloodbank123.netlify.app/ ) | 
