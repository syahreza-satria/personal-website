// Field definitions for CrudModal, one set per content type.
// Field names match the keys the owning page reads from `initialData` (see each page's handleSave).

export const achievementFields = [
  {
    name: "type",
    label: "Achievement Type",
    type: "select",
    options: ["Certification", "Award", "Course", "Participation", "Professional", "other"],
    required: true,
    half: true,
  },
  {
    name: "category",
    label: "Field",
    type: "select",
    options: ["Tech", "Design", "Language", "Management", "Other"],
    required: true,
    half: true,
  },
  {
    name: "title",
    label: "Title",
    placeholder: "e.g. Google UX Design Professional Certificate",
    required: true,
  },
  {
    name: "organizer",
    label: "Issued By",
    placeholder: "e.g. Coursera, Dicoding, Google",
    required: true,
    half: true,
  },
  { name: "issuedDate", label: "Date Issued", type: "date", required: true, half: true },
  {
    name: "credentialId",
    label: "Credential ID / License No.",
    placeholder: "e.g. ABC123XYZ",
    help: "Shown on the card so visitors can verify it.",
  },
  {
    name: "image",
    label: "Certificate Image",
    type: "image",
    help: "Upload a scan/screenshot of the certificate or award.",
  },
];

export const gearFields = [
  {
    name: "category",
    label: "Category",
    type: "select",
    options: ["Computer", "Video", "Audio"],
    required: true,
    half: true,
  },
  { name: "brand", label: "Brand", placeholder: "e.g. Logitech, ASUS, Shure", required: true, half: true },
  { name: "model", label: "Model / Product Name", placeholder: "e.g. MX Master 3S", required: true },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "What do you use it for? Key specs, why you picked it...",
    required: true,
  },
  {
    name: "link",
    label: "Product Link",
    type: "url",
    placeholder: "https://...",
    help: "Store or manufacturer page.",
  },
  { name: "image", label: "Photo", type: "image", help: "A square photo of the item works best." },
];

export const experienceFields = [
  { name: "role", label: "Job Title", placeholder: "e.g. Full-Stack Web Developer", required: true },
  { name: "company", label: "Company / Organization", placeholder: "e.g. PT Example Teknologi", required: true, half: true },
  { name: "location", label: "Location", placeholder: "e.g. Bandung, Indonesia", half: true },
  {
    name: "type",
    label: "Employment Type",
    type: "select",
    options: ["Full-time", "Part-time", "Freelance", "Contract", "Internship", "Volunteer"],
    required: true,
    half: true,
  },
  {
    name: "setup",
    label: "Work Setup",
    type: "select",
    options: ["Onsite", "Hybrid", "Remote"],
    required: true,
    half: true,
  },
  { name: "start_date", label: "Start Date", type: "date", required: true, half: true },
  {
    name: "end_date",
    label: "End Date",
    type: "date",
    half: true,
    help: "Leave empty if you still work here (shown as “Present”).",
  },
  {
    name: "responsibilities",
    label: "Responsibilities & Achievements",
    type: "list",
    placeholder: "One item per line, e.g.\nBuilt the checkout flow with Next.js and Supabase\nCut page load time by 40%",
    help: "Write each bullet point on its own line.",
    required: true,
  },
  { name: "logo", label: "Company Logo", type: "image", help: "Square logo, shown beside the role." },
];

export const educationFields = [
  { name: "school", label: "School / University", placeholder: "e.g. Telkom University", required: true },
  {
    name: "degree",
    label: "Degree / Level",
    type: "select",
    options: ["High School", "Vocational High School", "Diploma (D3)", "Bachelor's (S1)", "Master's (S2)", "Bootcamp", "Course / Certificate"],
    required: true,
    half: true,
  },
  { name: "major", label: "Major / Program", placeholder: "e.g. Informatics Engineering", half: true },
  {
    name: "gpa",
    label: "GPA",
    type: "number",
    step: "0.01",
    min: "0",
    max: "4",
    placeholder: "e.g. 3.75",
    help: "On a 4.00 scale. Leave empty to hide.",
    half: true,
  },
  { name: "location", label: "Location", placeholder: "e.g. Bandung, Indonesia", half: true },
  { name: "start_date", label: "Start Date", type: "date", required: true, half: true },
  {
    name: "end_date",
    label: "End / Graduation Date",
    type: "date",
    half: true,
    help: "Leave empty if you're still studying (shown as “Present”).",
  },
  { name: "logo", label: "School Logo", type: "image", help: "Square logo or crest." },
];
