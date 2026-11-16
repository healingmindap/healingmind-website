HEALING MIND COUNSELLING CENTRE — WEBSITE (EASY-EDIT VERSION)
=============================================================

HOW TO VIEW
-----------
Double-click  index.html  — it opens in your browser.

HOW TO EDIT — VERY SIMPLE
-------------------------
You never need to touch the HTML files.

1) TEXT  →  open the "content" folder. Each file = one section:

   content/1-basic-info.js    Phone numbers, WhatsApp, email, name, timings
   content/2-addresses.js     Branch addresses (add/remove branches too)
   content/3-home.js          Home page heading, intro, the 4 numbers, steps
   content/4-about.js         Mission, vision, about text, psychologist profile
   content/5-services.js      All services (add/remove/change any service)
   content/6-testimonials.js  Client reviews
   content/7-faq.js           Questions & answers
   content/8-careers.js       Job openings (careers page)
   content/9-workshops.js     Workshop topics (workshops page)
   content/10-policy.js       Centre policies (policy page)
   content/11-gallery.js      Gallery photos & captions (gallery page)
   content/12-team.js         Team members (Our Team page)
   content/13-selfhelp.js     Self-Help Corner: helplines, tips, when to seek help
   content/14-conditions-therapies.js   Conditions we treat & therapies we offer (Services page)

   Open any file in Notepad, change ONLY the text between the
   quotes "...", save, then refresh the browser. Done.

2) IMAGES  →  open the "images" folder.
   Every photo on the site has its own named file there
   (logo.png, psychologist.jpg, hero-background.jpg, service-…, gallery-…).
   Replace a file with your photo using the SAME NAME → it shows on the site.
   Full list of every photo and where it appears:  images/_IMAGE-GUIDE.txt

WHAT NOT TO TOUCH
-----------------
   css/style.css   (design/colours — ask Claude to change these)
   js/render.js    (the engine that builds the pages)
   *.html          (just empty shells — nothing to edit there)

BOOKING
-------
The appointment form opens WhatsApp with the request pre-filled.
To change the WhatsApp number, edit "whatsapp" in content/1-basic-info.js
(country code + number, no + sign, no spaces).

TO PUT IT LIVE
--------------
Upload ALL files & folders to the hosting (GoDaddy) so index.html is in
the root — the domain www.healingmindcounselling.com stays the same.

STAFF LOGIN (staff.html) — DEMO MODE
------------------------------------
Link: "Staff Login" at the very bottom of every page.
  Username     Password        Sees
  admin        admin@123       everything, incl. patient remarks; export CSV
  reception    reception@123   all appointments (patient remarks hidden)
  pragya       pragya@123      only Pragya's appointments, with remarks
  pooja        pooja@123       only Pooja's appointments, with remarks

IMPORTANT: in demo mode appointments are saved only in the browser of
the device where they were made. Before real patient use, connect a
secure database (e.g. Supabase) with proper individual passwords —
passwords checked inside a public website are not real security.
