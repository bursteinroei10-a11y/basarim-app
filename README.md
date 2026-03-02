# בשרים על הדרך — Premium Meat Pre-Order Platform

פלטפורמת הזמנת בשר פרימיום. Hebrew RTL, mobile-first, גלאסמורפי.

## התחלה מהירה

### 1. התקנת תלויות

```bash
npm install
```

### 2. הגדרת מסד נתונים

צור פרויקט [Supabase](https://supabase.com) והורד את ה-Connection string.

צור קובץ `.env` (או העתק מ-`.env.example`):

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

### 3. יצירת טבלאות וזריעה

```bash
npm run db:push
npm run db:seed
```

### 4. הפעלת השרת

```bash
npm run dev
```

פתח [http://localhost:3000](http://localhost:3000).

## דפים

| נתיב | תיאור |
|------|-------|
| `/` | קטלוג מוצרים |
| `/checkout` | השלמת הזמנה |
| `/order-confirmed` | אישור הזמנה |
| `/admin` | ניהול הזמנות |
| `/admin/orders/[id]` | פרטי הזמנה + עדכון סטטוס |
| `/admin/cutoff` | הגדרת סגירת הזמנות (חל cutoff) |
| `/my-orders` | ההזמנות שלי (לפי אימייל) + הזמן שוב |

## התחברות למנהל (/admin)

כדי להגן על פאנל הניהול:

1. הוסף ל־`.env`:
   ```env
   AUTH_SECRET="your-secret"   # הרץ: npx auth secret
   ADMIN_EMAIL="your@email.com"
   ADMIN_PASSWORD="your-password"
   ```
2. רק המשתמש עם האימייל והסיסמה האלו יוכל לגשת ל־`/admin`.

## התראות למנהל (Web Push)

כדי לקבל התראה בדפדפן בכל הזמנה חדשה:

1. צור מפתחות VAPID: `npx web-push generate-vapid-keys`
2. הוסף ל־`.env`: `VAPID_PUBLIC_KEY` ו־`VAPID_PRIVATE_KEY`
3. הרץ `npm run db:push` (טבלת AdminPushSubscription)
4. בפאנל הניהול לחץ על "הפעל התראות" ואשר בדפדפן

## סקריפטים

- `npm run dev` — שרת פיתוח
- `npm run build` — בניית production
- `npm run db:generate` — יצירת Prisma Client
- `npm run db:push` — סנכרון סכמה למסד נתונים
- `npm run db:seed` — הזנת קטלוג ראשוני

## מבנה

```
src/
├── app/
│   ├── page.tsx         # קטלוג
│   ├── checkout/        # תשלום
│   ├── order-confirmed/ # אישור
│   ├── admin/           # פאנל ניהול
│   └── api/
│       ├── products/    # API מוצרים
│       └── orders/       # API הזמנות
├── components/
├── lib/
└── store/               # Zustand cart
```
