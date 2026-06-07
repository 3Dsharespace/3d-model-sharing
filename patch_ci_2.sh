const fs = require('fs');
let content = fs.readFileSync('.github/workflows/ci.yml', 'utf-8');

// The Vercel action doesn't have the token, so we can ignore it for PRs or mock it, or just ignore errors.
// Actually, it fails if secrets are empty, but this is a PR from a fork perhaps?
// Let's modify the checkout action to have fetch-depth: 0
content = content.replace(
    /    - name: Checkout code\n      uses: actions\/checkout@v4/g,
    '    - name: Checkout code\n      uses: actions/checkout@v4\n      with:\n        fetch-depth: 0'
);

// For the frontend job, Vercel action is failing because VERCEL_TOKEN is not supplied.
// We can change the `if` condition to only run if secrets.VERCEL_TOKEN is present
content = content.replace(
    "if: github.ref == 'refs/heads/main'",
    "if: github.ref == 'refs/heads/main' && env.VERCEL_TOKEN != ''\n      env:\n        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}"
);
content = content.replace(
    "if: github.ref != 'refs/heads/main'",
    "if: github.ref != 'refs/heads/main' && env.VERCEL_TOKEN != ''\n      env:\n        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}"
);

fs.writeFileSync('.github/workflows/ci.yml', content);
