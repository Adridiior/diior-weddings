# DIIOR Weddings – Wedding Photography Portfolio Website

A responsive, production-ready multipage website built for a wedding photography brand.  
The project focuses on clean design, accessibility, and real-world frontend logic, with a lightweight Node.js backend for form handling.

👉 **Live Demo:** https://diiorweddings.netlify.app/

---

## Overview

DIIOR Weddings is a real-world web project designed and developed to showcase a professional photography portfolio.  
It is not a template or a tutorial-based project, but a fully custom website built with attention to UX, responsiveness, and maintainability.

---

## Key Features

- Responsive navigation with accessible mobile menu
- Custom hero slider and portfolio slider (desktop and mobile behavior)
- Fully responsive multipage layout (Home, Portfolio, About, Contact)
- Contact form with:
  - client-side validation
  - inline error handling and UX feedback
  - AJAX submission (no page reload)
- Server-side validation and email delivery via Node.js
- Environment-based configuration using `.env`

---

## Tech Stack

**Frontend**
- HTML5
- CSS3 (custom responsive layout, no frameworks)
- Vanilla JavaScript (DOM manipulation, events, fetch)

**Backend**
- Node.js
- Express
- Nodemailer
- Validator
- dotenv

**Deployment**
- Netlify (frontend)
- Node/Express ready for deployment on platforms like Render

---

## Project Structure

/
├── index.html
├── portfolio.html
├── about.html
├── contact.html
├── style.css
├── script.js
├── server.js
├── package.json
├── .env.example
├── immagini/
├── icons/
└── gif/


---

## Local Development

1. Clone the repository
2. Install dependencies:

```bash
npm install
```
##
3. Create a .env file based on .env.example
4. Run the development server:

```bash
npm run dev
```

The server will start on http://localhost:3000.

