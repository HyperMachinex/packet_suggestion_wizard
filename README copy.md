# To run system

run containrs --> **`docker compose up --build`** \
Page created on **`http://0.0.0.0:8000/`** \


# Mongodb List Saved Jsons

mongodb container --> **`docker exec -it mongodb mongosh`** \

mongosh commands to see users -->   **`show dbs`** \
                                    **`use features_app`** \
                                    **`show collections`** \
                                    **`db.summaries.find().sort({ _id: -1 }).limit(3)`** \


# Priority System:

1. Enterprise Features (Highest Priority)
   - Mobil Uygulama SDK (Mobile App SDK)
   - Sohbet yönlendirme (Chat Routing)
   - Sohbet API (Chat API)
2. Enterprise Requirements (Second Priority)
   - Sınırsız temsilci sayısı (Limitless agents)
   - 100K+ aylık mesaj hacmi (100K+ monthly message volume)
3. Premium Requirements (Third Priority)
   - 10K-100K aylık mesaj hacmi (10K-100K monthly message volume)
4. Premium Features (Fourth Priority)
   - Whatsapp Entegrasyonu (WhatsApp Integration)
   - Facebook, Instagram ve Telegram'da Sesli Mesajlar (Voice Messages in Social Media)
   - Apple Business Chat
   - Etkileşimli mesaj kampanyaları (Interactive Message Campaigns)
   - Google Analytics Entegrasyonu (Google Analytics Integration)
   - Pazarlama İstatistikleri (Marketing Statistics)
   - Sohbetleri ziyaretçinin coğrafi konumuna göre dağıtma (Route chats by visitor location)
   - Kanalları ayarlarıyla kopyalama (Copy channels with settings)
   - Temsilci Durum Bilgisi (Agent Status Information)
   - Farklı kanallara farklı temsilciler atama (Assign different agents to different channels)
   - Site Webhookları (Site Webhooks)
   - Çalışanların erişim hakları ve rollerini düzenleme (Manage employee access rights and roles)
5. Pro Requirements (Fifth Priority)
   - 1K-10K aylık mesaj hacmi (1K-10K monthly message volume)
6. Pro Features (Sixth Priority)
   - Akıllı tetikleyicilerle hedefli sohbetler başlatma (Smart trigger-based targeted chats)
   - Sohbet öncesi butonlar (Pre-chat buttons)
   - Dosya gönderme-alma (File send/receive)
   - Canlı ziyaretçi takibi ve manuel mesaj gönderme (Live visitor tracking and manual messaging)
   - IP adresi, coğrafi bölge ve ziyaret kaynağı bilgileri (IP, geographic region, and visit source info)
   - İşaretçi aracı (Pointer tool for visitor guidance)
   - CRM Modülü ile müşteri ve satış takibi (CRM module for customer and sales tracking)
   - Excel'e veri dökümü alma (Export data to Excel)
   - Servis kalitesi geribildirimleri (Service quality feedback)
   - Yazım denetimi (Spell checking)
   - Taslak cevaplar (Draft responses)
   - Çoklu temsilcili sohbetler (Multi-agent chats)
   - Mesai saatleri belirleme (Set working hours)
   - Gönderim sonrası yanıt düzenleme (Edit responses after sending)
   - Temsilciler arası sohbet aktarımı (Transfer chats between agents)
   - JavaScript API ve WebHooklar (JavaScript API and WebHooks)
   - CRM sağlayıcılarla entegrasyon (CRM provider integration)
   - Spam koruması (Spam protection)
7. Free Package (Seventh Priority)
   - Only for 2 agents + 0-1K messages
