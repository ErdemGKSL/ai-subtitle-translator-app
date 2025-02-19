
# Electron + SvelteKit 5 Template

This is a **template project** for building desktop applications using **Electron** and **SvelteKit 5**. It includes a modern development setup with live-reload, static builds, and cross-platform packaging using `electron-builder`. **Powered by Bun for superior performance**.

## Features

- **SvelteKit 5** for a modern, reactive frontend.
- **Electron** for cross-platform desktop app development.
- **TailwindCSS** for utility-first styling.
- Development workflow with **live-reloading** for both Electron and SvelteKit.
- Cross-platform packaging via **electron-builder**.
- Prettier integration for code formatting (including Tailwind and Svelte support).

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- [Bun](https://bun.sh/) (version 1.0 or higher)
- Node.js (for compatibility)
- Git (for version control)

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/electron-sveltekit-template.git
   cd electron-sveltekit-template
   ```

2. Install dependencies using Bun:

   ```bash
   bun install
   ```

### Development

Start the development environment with live-reloading:

```bash
bun run dev
```

This will concurrently:

- Start the SvelteKit development server.
- Launch the Electron application once the SvelteKit server is ready.

### Building the Application

#### Build SvelteKit

To build the SvelteKit app:

```bash
bun run build:svelte
```

This creates the static frontend files in the `dist` folder.

#### Package for Production

To package the application for your platform:

- **Windows**:

  ```bash
  bun run build:electron:win
  ```

- **Mac**:

  ```bash
  bun run build:electron:mac
  ```

- **Linux**:

  ```bash
  bun run build:electron:linux
  ```

The output package can be found in the `dist` folder.

## Commands Overview

| Command                          | Description                                                      |
|----------------------------------|------------------------------------------------------------------|
| `bun run dev`                    | Start the development environment with live-reloading.          |
| `bun run build:svelte`           | Build the SvelteKit frontend for production.                    |
| `bun run build:electron:win`     | Package the app for Windows.                                    |
| `bun run build:electron:mac`     | Package the app for Mac.                                        |
| `bun run build:electron:linux`   | Package the app for Linux.                                      |

## Project Structure

```
electron-sveltekit-template/
├── src/
│   ├── backend/        # Electron main process
│   │   └── main.js
│   │   └── preload.js
│   ├── routes/         # SvelteKit routes
│   └── app.html        # HTML entry point
├── dist/               # Build output
├── package.json        # Project dependencies and scripts
└── vite.config.js      # Vite configuration
```

## Technologies Used

- **Bun** (for lightning-fast package management and scripts)
- **SvelteKit 5**
- **Electron**
- **Vite**
- **TailwindCSS**
- **electron-builder**
- **Prettier**

## Contributing

Feel free to fork this repository and make your own changes. Contributions are welcome!