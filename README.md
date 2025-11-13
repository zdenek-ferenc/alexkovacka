# ALEXKOVACKA

Tento projekt je vytvořen pomocí Next.js a Supabase pro backend. Můžete jej snadno nastavit a spustit pomocí několika kroků.

## Předpoklady

Než začnete, ujistěte se, že máte nainstalováno:

- [Node.js](https://nodejs.org/) (doporučená verze: 14.x nebo novější)
- [npm](https://www.npmjs.com/) (instalováno společně s Node.js)

## Instalace

## 1. Klonujte tento repozitář:

```bash
git clone https://github.com/uzivatel/vas-projekt.git
```

```bash
cd vas-projekt
```

## 2. Nainstalujte závislosti:

```bash
npm install
```

## 3. Konfigurace:

Pro správné fungování aplikace musíte vytvořit soubor .env.local v kořenovém adresáři projektu. Tento soubor bude obsahovat prostředí a anon klíče.

```bash
touch .env.local
```

Přidejte následující proměnné do souboru .env.local:

```bash
NEXT_PUBLIC_SUPABASE_URL=vaše_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=vaš_anon_key
SUPABASE_SERVICE_KEY=vaš_service_key
ADMIN_USERNAME=vaše_admin_jméno
ADMIN_PASSWORD=vaše_admin_heslo
```


## 4. Spuštění aplikace

Po úspěšné instalaci a konfiguraci můžete aplikaci spustit:

```bash
npm run dev
```

Vývoj
Pokud chcete přispět do vývoje tohoto projektu, doporučujeme použít VSCode nebo jiný editor, který podporuje moderní JavaScript (ES6+) a Next.js.
