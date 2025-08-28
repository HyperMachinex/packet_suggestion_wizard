# app/main.py
from fastapi import FastAPI, Request, APIRouter, Body, BackgroundTasks  # + BackgroundTasks
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from email.message import EmailMessage
import aiosmtplib
import os
import json

router = APIRouter()
app = FastAPI()

# --- MongoDB ---
mongo_uri = os.getenv("MONGO_URI", "mongodb://mongodb:27017")
client = AsyncIOMotorClient(mongo_uri)
db = client["features_app"]
users_collection = db["clients"]

# --- Templates & Statics ---
templates = Jinja2Templates(directory="app/templates")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# --- Mail Ayarları (ENV) ---
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))           # STARTTLS için 587
SMTP_USER = os.getenv("SMTP_USER", "")                   # örn: yourname@gmail.com
SMTP_PASS = os.getenv("SMTP_PASS", "")                   # örn: Gmail App Password
MAIL_FROM = os.getenv("MAIL_FROM", SMTP_USER or "no-reply@example.com")
MAIL_TO   = os.getenv("MAIL_TO", "armagantoros22@gmail.com")   # hedef e-posta
MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").lower() in ("true", "1", "yes")

def _pretty(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=2, default=str)

async def send_email_async(subject: str, html_body: str, to: str | None = None):
    """aiosmtplib ile async e-posta gönderimi"""
    recipient = to or MAIL_TO
    msg = EmailMessage()
    msg["From"] = MAIL_FROM
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.set_content("HTML desteklemeyen istemciler için düz metin.")
    msg.add_alternative(html_body, subtype="html")

    await aiosmtplib.send(
        msg,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        start_tls=MAIL_USE_TLS,         # True -> STARTTLS
        username=SMTP_USER or None,
        password=SMTP_PASS or None,
        timeout=20,
    )

# --- Routes ---
@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/summary")
async def save_summary(
    payload: dict = Body(...),
    background_tasks: BackgroundTasks = None
):
    """Kayıt + aynı anda mail atma (BackgroundTasks ile)"""
    res = await db["summaries"].insert_one(payload)
    inserted_id = str(res.inserted_id)

    subject = f"[FeaturesApp] Yeni Summary Kaydı: {inserted_id}"
    html = f"""
    <h2>Yeni Summary Kaydı</h2>
    <p><b>Mongo ID:</b> {inserted_id}</p>
    <pre style="background:#f6f8fa;padding:12px;border-radius:8px;">{_pretty(payload)}</pre>
    """

    # İstek dönerken maili arkada gönder:
    if background_tasks is not None:
        background_tasks.add_task(send_email_async, subject, html)
    else:
        # Çok nadiren None olabilir; garanti olsun diye await
        await send_email_async(subject, html)

    return {"id": inserted_id}

@app.get("/health", include_in_schema=False)
async def health():
    return {"ok": True}

app.include_router(router, prefix="")
