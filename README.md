# Audit Orchestrator V2 — site

Static site. No build step. GitHub Pages can serve it for free.

## Publish

1. Create an empty public repository on GitHub.
2. From this folder, push the files. `index.html` must stay at the repository root.
3. In the repository, open Settings, then Pages. Set the source to the branch you pushed and the folder `/ (root)`.
4. The site URL is the one Pages shows, usually `https://USER.github.io/REPOSITORY/`.

`.nojekyll` is included so Pages serves the GIF and the image files as they are.

## Contact address

Edit `js/config.js` and replace `change-me@example.com` with the address that should appear in the footer. Reload the page. The mail button uses that value.
