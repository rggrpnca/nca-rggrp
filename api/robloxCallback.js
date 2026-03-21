import { readFileSync } from "fs";
import { join } from "path";

const AUTHORISED_USERS = ["ashtonjohan_4729", "Bruhwhatthesksk"];

export default async function handler(req, res) {
    const { code, error } = req.query;

    if (error) return res.redirect(`/login.html?error=${error}`);
    if (!code) return res.redirect("/login.html?error=no_code");

    try {
        const tokenRes = await fetch("https://apis.roblox.com/oauth/v1/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.ROBLOX_CLIENT_ID,
                client_secret: process.env.ROBLOX_CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: "https://nca-rggrp.vercel.app/api/robloxCallback"
            })
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) return res.redirect("/login.html?error=token_failed");

        const userRes = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });

        const userInfo = await userRes.json();
        const username = userInfo.preferred_username || userInfo.name || "";

        if (!AUTHORISED_USERS.map(u => u.toLowerCase()).includes(username.toLowerCase())) {
            return res.status(403).send(`
                <html>
                <body style="background:#0a0a0a;color:white;font-family:Montserrat,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
                    <div style="text-align:center">
                        <h2 style="color:#ff5555;">Access Denied</h2>
                        <p style="color:#555;">You are not authorised to access this panel.</p>
                        <a href="/login.html" style="color:#00b3ff;margin-top:16px;display:block;">Go Back</a>
                    </div>
                </body>
                </html>
            `);
        }

        // Serve admin page directly — no redirect, no token in URL
        const adminHtml = readFileSync(join(process.cwd(), "admin.html"), "utf8");
        const injected = adminHtml.replace(
            "<head>",
            `<head><script>sessionStorage.setItem("nca_token", "${process.env.ADMIN_SECRET_TOKEN}");</script>`
        );

        res.setHeader("Content-Type", "text/html");
        res.setHeader("Cache-Control", "no-store");
        res.status(200).send(injected);

    } catch (err) {
        console.log("Error:", err.message);
        res.redirect("/login.html?error=server_error");
    }
}
