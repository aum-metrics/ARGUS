/**
 * Author: Sambath Kumar Natarajan
 */

import chalk from 'chalk';

async function testBackend() {
    console.log(chalk.blue(">>> STARTING BACKEND API CHECK <<<"));

    const url = "http://localhost:3000/api/chatgpt";
    console.log(`Target: ${url}`);

    try {
        const start = Date.now();
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: "PING", apiKey: "TEST" })
        });
        const duration = Date.now() - start;

        console.log(`Status: ${res.status} ${res.statusText}`);
        console.log(`Latency: ${duration}ms`);

        if (res.ok) {
            const data = await res.json();
            console.log(chalk.green("✔ API Route is reachable and returned 200 OK"));
            console.log("Response Preview:", JSON.stringify(data).substring(0, 100));
        } else {
            // Even if it fails (e.g. 500 from missing key), the ROUTE is alive.
            const text = await res.text();
            console.log(chalk.yellow(`! API Route responded with ${res.status} (This confirms backend logic is running)`));
            console.log("Error Body:", text.substring(0, 100));
        }

    } catch (e: any) {
        console.log(chalk.red("✘ API Call Failed - Server might not be reachable."));
        console.log("Error:", e.message);
        if (e.cause) console.log("Cause:", e.cause);
    }
}

testBackend();
