# Sound Garden

Sound Garden is a Firebase engagement poll. Visitors select a mood, enter one
song title, and add a flower to a collective garden. Each flower color represents
one poll option, while the live percentages aggregate all responses.

## Files

- `index.html` — poll, results, garden, and Firebase CDN scripts
- `style.css` — responsive layout and CSS-generated flowers
- `poll-app.js` — poll options, Firebase configuration, real-time data, and UI

## Connect Firebase

1. Create a free project at <https://console.firebase.google.com/>.
2. Add a Web app from **Project settings → Your apps**.
3. Open **Build → Realtime Database**, create a database, and choose test mode
   for the classroom prototype.
4. Copy the Web app configuration object.
5. In `poll-app.js`, replace every placeholder inside `firebaseConfig`.
6. Open the page through a local server or publish it with GitHub Pages.

Until real Firebase values are added, the site runs in demo mode and stores new
flowers only in the current browser using `localStorage`.

## Suggested classroom database rules

For an initial classroom demo, Firebase may provide temporary test-mode rules.
Before public use, configure validation and an appropriate write policy. Public
unrestricted writes should not be used for a long-term deployment.

## Data and ethics

The component stores the selected mood, song title, and submission timestamp.
It does not request names or contact information. Mood choices can still reveal
personal information, and song titles are displayed publicly, so the interface
asks visitors not to enter identifying or sensitive information.

## Submission description

> Sound Garden explores how music can represent a shared emotional atmosphere.
> Visitors anonymously select a mood and contribute one song title. Firebase
> aggregates the mood poll in real time, while every response becomes a flower
> in a collective garden. This approach could be used in an exhibition,
> classroom, or participatory archive to observe how a community's emotional
> soundtrack changes over time.
