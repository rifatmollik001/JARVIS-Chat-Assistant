J.A.R.V.I.S — Android / Termux Setup

গুরুত্বপূর্ণ:
- API key কাউকে পাঠাবেন না।
- .env ফাইল শুধু নিজের ফোনে রাখবেন।
- Gemini Free Tier-এ usage limit ও সাময়িক 503 সমস্যা থাকতে পারে।

১) ZIP extract করুন।
২) Termux-এ project folder-এ যান।
৩) চালান:
   npm install
৪) .env.example কপি করে .env বানান:
   cp .env.example .env
৫) nano .env চালিয়ে GEMINI_API_KEY-এর জায়গায় নিজের API key বসান।
৬) চালান:
   npm start
৭) Android Chrome-এ খুলুন:
   http://127.0.0.1:3000

মডেল ID:
.env ফাইলে GEMINI_MODEL সেট করা আছে। AI Studio-তে দেখানো model display name এবং API model ID এক নাও হতে পারে। 404 model-not-found এলে সঠিক API model ID যাচাই করতে হবে।

Voice:
- Chrome-এর microphone permission দিতে হবে।
- Speech recognition সব browser / Acode preview-তে চলে না।
- Text-to-speech ফোনের installed voice ও ভাষা সমর্থনের ওপর নির্ভরশীল।

সমস্যা:
- 503: Gemini সার্ভার ব্যস্ত হতে পারে।
- 429: Free Tier request limit শেষ হতে পারে।
- 404: model ID ভুল বা আপনার project-এ model নেই।
