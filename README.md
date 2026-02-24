# Chat_Application

Chat_Application je moderní chatovací platforma s prvky sociální sítě, která umožňuje uživatelům komunikovat soukromě i ve skupinových konverzacích, spravovat kontakty a interagovat pomocí sdílení obrázků a emoji.  

Aplikace je navržena tak, aby poskytovala bezpečné, přehledné a rychlé prostředí pro online komunikaci mezi uživateli.

## Funkce

### Uživatelský systém
- Registrace a přihlášení uživatelů
- Uživatelský profil s možností úpravy: jméno, avatar, popis, status
- Stav uživatele: online / offline / nerušit
- Role uživatelů: běžný uživatel a administrátor

### Kontakty a přátelé
- Vyhledávání uživatelů podle jména nebo e-mailu
- Odesílání, přijímání a odmítání žádostí o přátelství
- Seznam přátel s jejich aktuálním stavem
- Blokování a odebrání přátel

### Soukromé zprávy
- Odesílání textových zpráv mezi dvěma uživateli
- Historie konverzací se zobrazením starších zpráv
- Časové razítko a indikátor přečtení zprávy
- Seznam konverzací seřazený podle poslední aktivity

### Skupinové konverzace
- Vytváření skupin s názvem, popisem a obrázkem
- Přidávání a odebírání členů
- Role ve skupině: vlastník, správce, člen
- Přehled, kdo napsal kterou zprávu

### Sdílení obsahu
- Nahrávání a sdílení obrázků v konverzacích
- Náhledy obrázků přímo v chatu
- Podpora emoji

### Integrace externích služeb
- Aplikace umožňuje využití externích API pro obohacení komunikace, např. Giphy API nebo LinkPreview API

### Administrace
- Správa uživatelů: blokování, změna role, mazání účtů
- Přehled skupin a konverzací
- Možnost mazat nevhodný obsah
- Základní statistiky (počet uživatelů, zpráv, skupin, aktivních uživatelů)

### Ukázková data
- Aplikace obsahuje testovací uživatele a konverzace pro rychlé demo funkcionality

---

## Použité technologie

- **Backend:** Django + Django REST Framework  
- **Databáze:** SQLite (vývoj), možnost rozšíření na PostgreSQL / MySQL v produkci  
- **Autentizace a zabezpečení:** hashování hesel, CSRF ochrana, validace vstupů  

---

## Struktura projektu

```text
Chat_Application/
├── client/                 # Frontend (Vite + React)
│  ├── src/
│  │  ├── api/              # Axios instance a API volání
│  │  ├── assets/           # Obrázky, ikony, globální styly
│  │  ├── components/       # Znovupoužitelné UI komponenty (Button, Input, MessageBubble)
│  │  ├── hooks/            # Vlastní React hooky (např. useAuth, useChat)
│  │  ├── pages/            # Hlavní stránky (Login, Register, ChatRoom)
│  │  ├── store/            # Správa stavu (Context API nebo Redux)
│  │  ├── App.jsx           # Hlavní komponenta a definice routingu
│  │  └── main.jsx          # Vstupní bod Reactu
│  ├── public/              # Statické soubory
│  ├── .gitignore           # Ignorované soubory pro frontend (node_modules, dist)
│  ├── package.json         # Závislosti a skripty frontendu
│  └── vite.config.js       # Konfigurace Vite
├─ server/
│ ├─ config/                # Konfigurace Django projektu
│ ├─ users/                 # Modul pro uživatele (registrace, profily, role)
│ └─ chat/                  # Modul pro chat (zprávy, skupiny)
├─ manage.py                # Django management
├─ requirements.txt         # Závislosti projektu
├─ README.md                # Tento soubor
└─ .gitignore               # Ignorované soubory

```
## Instalace a spuštění (lokální)

```bash
git clone <repo-url>
cd server

python -m venv venv
source venv/bin/activate   # Linux/macOS
venv\Scripts\activate      # Windows

pip install -r requirements.txt

python manage.py migrate
python manage.py runserver
```
Backend bude dostupný na http://127.0.0.1:8000/.