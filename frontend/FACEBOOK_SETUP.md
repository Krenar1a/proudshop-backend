# Facebook Ads API - Udhëzime për Konfigurimin

## Hapat për të konfiguruar Facebook Ads API:

### 1. Krijo një Facebook App
1. Shko te [Facebook Developers](https://developers.facebook.com/)
2. Kliko "My Apps" dhe pastaj "Create App"
3. Zgjidh "Business" si lloj aplikacioni
4. Jep një emër për aplikacionin dhe email-in

### 2. Shto Facebook Marketing API
1. Në panelin e aplikacionit, kliko "Add Product"
2. Zgjidh "Marketing API" dhe kliko "Set Up"
3. Konfirmo që dëshiron të përdorësh Marketing API

### 3. Gjeneroni Access Token
1. Në panelin e "Marketing API", kliko "Tools"
2. Zgjidh "Graph API Explorer"
3. Zgjidh aplikacionin tuaj dhe faqen/ad account-in
4. Gjeneroni një "User Access Token" me këto permissions:
   - `ads_management`
   - `ads_read`
   - `business_management`
   - `pages_read_engagement`

### 4. Merr Ad Account ID
1. Shko te [Facebook Business Manager](https://business.facebook.com/)
2. Zgjidh "Ad Accounts" nga menuja
3. Kopjo ID-në e Ad Account-it (format: act_XXXXXXXXXX)

### 5. Merr Page ID
1. Shko te faqja juaj në Facebook
2. Kliko "About" dhe gjeni Page ID në fund të faqes
3. Ose përdorni Graph API Explorer me `/me/accounts`

### 6. Plotëso .env File
```env
FACEBOOK_ACCESS_TOKEN="EAAxxxxxxxxx"
FACEBOOK_AD_ACCOUNT_ID="1234567890"  # Pa prefix 'act_'
FACEBOOK_PAGE_ID="1234567890"
FACEBOOK_APP_ID="1234567890"
FACEBOOK_APP_SECRET="xxxxxxxxxxxxxxxx"
```

### 7. Verifiko Access Token
Testo nëse API-ja funksionon duke thirrur:
```
GET https://graph.facebook.com/v18.0/me?access_token=YOUR_TOKEN
```

## Kufizime dhe Shënime:
- Access tokens kanë afat (zakonisht 60 ditë)
- Për production, përdorni Long-lived tokens ose refresh tokens
- Aplikacioni duhet të jetë i verifikuar për përdorim në production
- Duhet të keni Ad Account me balance pozitiv për të krijuar reklama

## Testimi:
Pasi të plotësoni konfigurimin, testoni duke krijuar një reklamë nga admin panel.
