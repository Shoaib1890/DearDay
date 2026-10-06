# DearDay

**Never forget someone's special day.**

DearDay is an offline-first Android birthday reminder app built with Expo and React Native. Store birthdays for people you care about, see what is coming up, and get local notifications on their day—even when the app is closed.

- **Package:** `com.dearday.app`
- **Version:** `1.0.0` (Android `versionCode` 1)
- **Expo project:** [@shy1890/dearday](https://expo.dev/accounts/shy1890/projects/dearday)

No account, no backend, no cloud database. Data stays on the device unless you export it.

---

## Features

| Area | Details |
| --- | --- |
| People | Add, edit, delete; name, birthday, relationship, photo, phone, notes |
| Dates | Age, next birthday, countdown; Feb 29 → Feb 28 in non-leap years |
| Home | Greeting, today's birthdays, upcoming list, first-launch welcome |
| People tab | Search, sort by upcoming or A–Z |
| Reminders | Local notifications (default 9:00 AM), per-person on/off and time |
| Appearance | System, light, or dark theme |
| Data | JSON export / import, clear all |
| Actions | Call and SMS when a phone number is set |

---

## Tech stack

- React Native 0.86 · Expo SDK 57 · TypeScript (strict)
- Expo Router · AsyncStorage · expo-notifications
- expo-image-picker · expo-file-system · expo-document-picker · expo-sharing
- EAS Build for Android production `.aab`

---

## Project structure

```text
dearday/
├── app.json              # Expo config (name, package, plugins)
├── eas.json              # EAS build profiles (preview APK, production AAB)
├── src/
│   ├── app/              # Expo Router screens
│   ├── components/
│   ├── constants/        # Theme & colors (#1A7F5A)
│   ├── hooks/
│   ├── lib/              # Storage, dates, notifications, validation
│   └── types/
├── assets/images/        # Icon & splash
├── releases/             # Local .aab copies (gitignored)
└── scripts/verify-dates.ts
```

---

## Prerequisites

- Node.js 20+ and npm
- [Expo Go](https://expo.dev/go) on your phone (UI testing only)
- [EAS CLI](https://docs.expo.dev/build/setup/) for real builds: `npm install -g eas-cli`

---

## Local development

```bash
npm install
npm run start          # Expo Go (press s in terminal if needed)
npm run typecheck
```

**Android reminders do not work in Expo Go** (SDK 53+). Use a preview/production build for notification testing.

---

## Android builds (EAS)

Log in once:

```bash
eas login
```

| Profile | Output | Use |
| --- | --- | --- |
| `preview` | APK | Install on device, test reminders |
| `production` | AAB | Google Play Store |

```bash
eas build --platform android --profile preview
eas build --platform android --profile production
```

Download artifacts from the [Expo builds page](https://expo.dev/accounts/shy1890/projects/dearday/builds) or save copies under `releases/` (gitignored).

Submit to Play (optional):

```bash
eas submit --platform android --profile production
```

---

## Notifications (production builds)

- One scheduled local notification per person: id `birthday:<personId>`
- Rescheduled on app launch and when people are saved, edited, or deleted
- Tap opens that person's screen
- **Expo Go on Android:** notifications are disabled (stub); UI still works

---

## Privacy

- No login, no analytics, no contacts/location/camera permissions
- Photos via system picker only; stored in app private storage
- In-app policy: Settings → Privacy Policy

---

## Play Store checklist (manual)

1. Google Play Console developer account ($25 one-time)
2. Store listing, screenshots, content rating, Data safety (on-device data, no collection)
3. Public privacy policy URL if required
4. Upload production `.aab`; new personal accounts may need closed testing first
5. Bump `version` and `android.versionCode` in `app.json` for each new release

---

## Push this repo to GitHub (when ready)

From this directory (`dearday/`):

```bash
git remote add origin <YOUR_REPO_URL>
git add .
git commit -m "DearDay 1.0.0 — initial release"
git push -u origin main
```

Do **not** commit `.aab` / `.apk` files, `.env`, or keystore files. The production bundle you downloaded can live in `releases/` or outside the repo.

---

## Known limitations

- Expo Go cannot test Android birthday notifications
- Export/import may not include photo files across devices
- Next-year reminders are refreshed when the app runs after a birthday fires

---

## License

Copyright © 2026. All rights reserved. This app is not open source unless you choose to license it otherwise.
