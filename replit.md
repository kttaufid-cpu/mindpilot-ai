# MindPilot AI - Landing Page

## Overview
A static landing page for MindPilot AI, an AI life assistant service. This is a single-page marketing website with Google Translate integration supporting 130+ languages.

## Project Structure
- `index.html` - Main landing page with embedded CSS
- `logo.png` - MindPilot AI logo
- `server.py` - Simple Python HTTP server for serving static files on port 5000

## Technology Stack
- **Frontend**: Pure HTML/CSS (no framework)
- **Translation**: Google Translate Widget
- **Server**: Python 3.11 SimpleHTTPServer
- **Port**: 5000 (frontend)

## Features
- Responsive design with mobile support
- Google Translate integration (130+ languages)
- Modern dark theme UI
- Marketing sections: Hero, Features, How it Works, Pricing, FAQ

## Development
The site is served using a simple Python HTTP server configured to:
- Bind to 0.0.0.0:5000 for Replit compatibility
- Disable caching for iframe preview compatibility
- Serve all static files from the root directory

## Recent Changes
- **2024-12-07**: Initial import and Replit environment setup
  - Installed Python 3.11
  - Created simple HTTP server with cache control
  - Configured workflow for frontend on port 5000
  - Added .gitignore for Python project
