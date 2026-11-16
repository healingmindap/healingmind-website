// ============================================================
//  TESTIMONIALS  —  client reviews shown on the home page.
//
//  ⭐ LIVE GOOGLE REVIEWS (optional):
//  Fill in the two values below and the website will automatically
//  show your latest Google reviews instead of the manual ones.
//
//  How to get them (one-time, ~15 minutes):
//  1. Go to  console.cloud.google.com  → create a project
//  2. Enable "Maps JavaScript API" and "Places API"
//     (needs billing enabled — Google gives free monthly credit,
//      this usage is practically free)
//  3. Create an API key (restrict it to your website domain!)
//  4. Find your Place ID at:
//     developers.google.com/maps/documentation/places/web-service/place-id
//     (search "Healing Mind Counselling Centre Chinchwad")
//
//  Until these are filled, the manual reviews below are shown.
// ============================================================

var GOOGLE_PLACE = {
  apiKey: "",      // paste API key between the quotes
  placeId: ""      // paste Place ID between the quotes
};

// ---- Manual reviews (shown when the API above is empty) ----
// ⚠️ Only paste REAL reviews (copy them from your Google profile).
//    While this list is empty, the website shows a "100+ Google reviews"
//    card with buttons to read & write reviews instead.
//
// Format — copy this line for each review, remove the // at the start:
//   { text: "Paste the review text here", who: "Reviewer first name" },

var TESTIMONIALS = [

];
