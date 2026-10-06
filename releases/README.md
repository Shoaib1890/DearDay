# Release artifacts

This folder is for **your own copies** of Play Store builds (`.aab`) and test APKs.

Files here are **not committed to git** (see root `.gitignore`).

Suggested naming:

```text
DearDay-1.0.0-1.aab
```

You can also keep releases one level up (e.g. next to this project folder) on your machine or in cloud backup.

To build a new production bundle:

```bash
eas build --platform android --profile production
```
