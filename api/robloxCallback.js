const AUTHORISED_USERS = ["ashtonjohan_4729", "Bruhwhatthesksk"];
const SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN;

export default async function handler(req, res) {
    const { code, error } = req.query;

    if (error) return res.redirect(`/login.html?error=${error}`);
    if (!code) return res.redirect("/login.html?error=no_code");

    try {
        // Exchange code for token
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
        console.log("Token response:", JSON.stringify(tokenData));

        if (!tokenData.access_token) {
            console.log("No access token received");
            return res.redirect("/login.html?error=token_failed");
        }

        // Get user info
        const userRes = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });

        const userInfo = await userRes.json();
        console.log("User info:", JSON.stringify(userInfo));

        // Try both possible username fields
        const username = userInfo.preferred_username || userInfo.name || userInfo.nickname || "";
        console.log("Username detected:", username);

        if (!AUTHORISED_USERS.map(u => u.toLowerCase()).includes(username.toLowerCase())) {
            console.log("User not authorised:", username);
            return res.status(403).send(`
                <html>
                <body style="background:#0a0a0a;color:white;font-family:Montserrat,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
                    <div style="text-align:center">
                        <h2 style="color:#ff5555;">Access Denied</h2>
                        <p style="color:#555;">You are not authorised to access this panel.</p>
                        <p style="color:#333;font-size:12px;">Detected username: ${username}</p>
                        <a href="/login.html" style="color:#00b3ff;margin-top:16px;display:block;">Go Back</a>
                    </div>
                </body>
                </html>
            `);
        }

        // Authorised!
        console.log("Access granted to:", username);
        res.redirect(`/api/getAdmin?token=${SECRET_TOKEN}`);

    } catch (err) {
        console.log("Error:", err.message);
        res.redirect("/login.html?error=server_error");
    }
}
