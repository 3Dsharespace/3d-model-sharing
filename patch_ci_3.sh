const fs = require('fs');
let content = fs.readFileSync('.github/workflows/ci.yml', 'utf-8');

content = content.replace(
    /uses: actions\/checkout@v4/g,
    'uses: actions/checkout@v4\n      with:\n        fetch-depth: 0'
);

content = content.replace(
    "if: github.ref == 'refs/heads/main'",
    "if: github.ref == 'refs/heads/main' && env.VERCEL_TOKEN != ''\n      env:\n        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}"
);
content = content.replace(
    "if: github.ref != 'refs/heads/main'",
    "if: github.ref != 'refs/heads/main' && env.VERCEL_TOKEN != ''\n      env:\n        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}"
);

fs.writeFileSync('.github/workflows/ci.yml', content);
