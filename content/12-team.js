// ============================================================
//  OUR TEAM  —  psychologists & counsellors
//  Shown on the home page ("Meet Our Psychologists"),
//  the About page and the Our Team page.
//
//  Each { ... }, block = one team member card.
//  To ADD a member: copy the example block at the bottom,
//  remove the // marks, fill in the details, and put their
//  photo in the images folder with the name you write in "image".
//  "mode" shows how they see clients (e.g. "Online sessions only").
//  "bookAs" = the short name used on the booking form.
// ============================================================

var TEAM = {
  intro: "A dedicated team committed to your mental well-being — trained, compassionate and here to listen.",

  members: [
    {
      name: "Pragya Rakesh Singh",
      bookAs: "Pragya",
      role: "Founder · Psychologist & Psychotherapist",
      image: "psychologist.jpg",
      qualifications: "Member of CCI & ICA",
      specialities: ["Counselling & Psychotherapy", "Anxiety", "De-addiction", "Adolescents"],
      languages: "English · हिंदी · मराठी",
      mode: "In-person (Chinchwad) & Online",
      bio: "Pragya Rakesh Singh is a dedicated psychologist and psychotherapist with a strong commitment to mental well-being. A member of the CCI and ICA, she combines professional expertise with compassionate care to support individuals on their journey to emotional healing and growth."
    },

    {
      name: "Pooja Gahlot",
      bookAs: "Pooja",
      role: "Psychologist & Psychotherapist",
      image: "pooja.jpg",
      specialities: ["Addiction Treatment", "BPD", "and more"],
      mode: "Online sessions only",
      onlineOnly: true,
      bio: "Pooja Gahlot is a psychologist and psychotherapist specialising in addiction treatment and Borderline Personality Disorder (BPD), along with other emotional and behavioural concerns. She works with clients through online sessions."
    },

    {
      placeholder: true,
      name: "More experts joining soon",
      role: "Psychologists & Counsellors",
      text: "Our team is growing. New psychologists and counsellors will be introduced here."
    }

    // ---- EXAMPLE: copy this block to add a real team member ----
    // ,{
    //   name: "Full Name",
    //   bookAs: "Firstname",
    //   role: "Counselling Psychologist",
    //   image: "team-fullname.jpg",
    //   qualifications: "M.A. Clinical Psychology",
    //   specialities: ["Anxiety", "Relationships", "Students"],
    //   languages: "English · हिंदी · मराठी",
    //   mode: "In-person (Chinchwad) & Online",
    //   bio: "Two or three sentences about the person."
    // }
  ]
};
