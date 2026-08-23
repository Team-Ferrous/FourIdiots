import { defineConfig } from "vite";

export default defineConfig({
    test: {
        // Simulation.ts is pure logic, so the fast node
        // environment is enough. Rendering is not tested here.
        environment: "node",
        include: ["tests/**/*.test.ts"]
    }
});
