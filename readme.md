<p align="center"><img src="./public/banner.png" width="500" height="150" alt="Project Logo"></p>
<p align="center">
    <a href="https://github.com/riipandi/next-platform/pulse">
        <img src="https://img.shields.io/badge/Contributions-welcome-blue.svg?style=flat-square" alt="Contribution welcome">
    </a>
    <a href="https://github.com/riipandi/next-platform">
        <img src="https://img.shields.io/github/languages/top/riipandi/next-platform?style=flat-square" alt="Top language">
    </a>
    <a href="https://aris.mit-license.org">
        <img src="https://img.shields.io/github/license/riipandi/next-platform?style=flat-square" alt="License">
    </a>
</p>

## Introduction

A starter project for Multi-tenant [Next.js](https://nextjs.org/) with [Tailwind CSS](https://tailwindcss.com)
and [Typescript](https://www.typescriptlang.org/). Inspired from [Platforms Starter Kit by Vercel](https://github.com/riipandi/next-platform), 
this starter kit already pre-configured with [absolute import](https://jsdev.org/env/nodejs/absolute-path-imports/),
[TailwindUI](https://tailwindui.com), [Framer Motion](https://www.framer.com/motion/), and some [other goodies](./package.json).

Read [the guide](https://vercel.com/guides/nextjs-multi-tenant-application) to learn 
how to deploy your own version of this template.

## Quick Start

### Installation

```bash
# Using Yarn is recomended
npx create-next-app myapp-name -e "https://github.com/riipandi/next-platform"

# If you want to use npm instead
npx create-next-app myapp-name --use-npm -e "https://github.com/riipandi/next-platform"

# Generate Prisma migration
yarn prisma migrate dev --name initialize
yarn prisma migrate deploy
yarn prisma generate
```

> Don't forget to change `myapp-name` with your real application name.

### Up and Running

| NPM             | Yarn         | Description              |
| --------------- | ------------ | ------------------------ |
| `npm install`   | `yarn`       | install the dependencies |
| `npm run dev`   | `yarn dev`   | serve with hot reload    |
| `npm run build` | `yarn build` | build for production     |
| `npm run start` | `yarn start` | launch generated build   |

Application will run at `http://localhost:3000`

For detailed explanation on how things work, check out [Next.js docs](https://nextjs.org/docs/getting-started).

## Deploy your own

You'll want to fork this repository and deploy your own Next.js website. Once you have an
image generator that sparks joy, you can setup [automatic GitHub](https://vercel.com/github)
deployments so that pushing to master will deploy to production! ????

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Friipandi%2Fnext-platform)

## Built on open source

This working demo site was built using the Platforms Starter Kit and:

- [Next.js](https://nextjs.org/) as the React framework
- [Tailwind](https://tailwindcss.com/) for CSS styling
- [Prisma](https://prisma.io/) as the ORM for database access
- [PlanetScale](https://planetscale.com/) as the database (MySQL)
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Vercel](http://vercel.com/) for deployment

## Thanks to...

In general, I'd like to thank every single one who open-sources their
source code for their effort to contribute something to the open-source
community. Your work means the world! ???? ??????

## License

This project is open-sourced software licensed under the [MIT license](https://aris.mit-license.org).

Copyrights in this project are retained by their contributors.
See the [license file](./license.txt) for more information.
