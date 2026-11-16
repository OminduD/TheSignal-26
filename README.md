# THE SIGNAL // 2026

> An inter-university deep-tech hackathon website featuring an interactive 3D deep-sea experience, engineered by the IEEE Computer Society of UCSC.

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Ensure you have the following installed on your machine:

- **[Node.js](https://nodejs.org/)** (v18.0.0 or higher recommended)
- **npm** (comes with Node.js) or **pnpm** / **yarn**

---

### Installation & Local Setup

1. **Clone the repository** (if applicable):
   ```bash
   git clone https://github.com/OminduD/TheSignal-26.git
   cd TheSignal-26
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Open [http://localhost:5173](http://localhost:5173) (or the URL shown in your terminal) to explore the site.

---

## Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR). |
| `npm run build` | Runs TypeScript compilation (`tsc`) and bundles production assets with Vite. |
| `npm run preview` | Locally previews the production build from the `dist/` folder. |

---

## Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/)
- **3D Graphics**: [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/), [@react-three/drei](https://github.com/pmndrs/drei), and [postprocessing](https://pmndrs.github.io/postprocessing/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations & Scrolling**: [GSAP](https://gsap.com/) & [Lenis](https://lenis.darkroom.engineering/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Deployment

A GitHub Actions workflow is included at `.github/workflows/deploy.yml` for automated deployment to GitHub Pages.

To enable GitHub Pages:
1. Go to your repository **Settings** on GitHub.
2. Select **Pages** from the sidebar.
3. Under **Build and deployment > Source**, choose **GitHub Actions**.
4. Pushing commits to the `main` or `master` branch will automatically build and publish the site.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
