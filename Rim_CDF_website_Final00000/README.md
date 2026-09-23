# CDF Client Website - Enterprise OpenFOAM v2606 CFD Platform

**DEVELOPED by Akhil.A (`akkedu01@gmail.com`)**

A real, working, production-ready full-stack Computational Fluid Dynamics (CFD) simulation platform powered by **React 18 + TypeScript**, **Node.js/Express**, and **OpenFOAM v2606** running inside WSL2 Ubuntu 22.04 or Docker containers.

---

## Key Capabilities

- **Real OpenFOAM Execution:** No mock data. Runs `blockMesh`, `snappyHexMesh -overwrite`, `checkMesh`, `simpleFoam`, and `foamToVTK -latestTime`.
- **WSL2 Windows Path Isolation:** Automatically translates cases to `/tmp/of_cases/<uuid>/` to eliminate Windows username space path issues.
- **True Physical Wake Resolution:** Cuts cylinder geometries ($R = 0.5\text{ m}, H = 2.0\text{ m}$) into background block meshes, yielding $> 38,000$ cells, true boundary layer stagnation, and recirculating velocity wakes.
- **VTK & Telemetry Extraction:** Real-time extraction of cell count, points, max velocity, stagnation pressure, and aerodynamic drag ($C_D \approx 1.18$).
- **OWASP Top 10 Security:** Rate limiting, JWT authentication, parameterized commands, strict input sanitization, and isolated execution.

---

## Quickstart Guide

### 1. Prerequisites
- **Windows 11 with WSL2 Ubuntu 22.04**
- **OpenFOAM v2606** installed inside WSL2 (`source /usr/lib/openfoam/openfoam2606/etc/bashrc`)
- **Node.js 18+** installed

### 2. Launch Backend (WSL2 / Windows)
```bash
# In WSL2 or Windows terminal:
node server.js
```
The backend starts on `http://localhost:3001`.

### 3. Launch Frontend
```bash
npm install
npm run dev
```
The frontend is hosted on `http://localhost:3000` with the `/api` reverse proxy mapped to port 3001.

---

## Developer Contact
**DEVELOPED by Akhil.A gmail :- akkedu01@gmail.com**
