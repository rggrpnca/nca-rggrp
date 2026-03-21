export default function handler(req, res) {
    const token = req.query.token;
    
    if (token !== process.env.ADMIN_SECRET_TOKEN) {
        return res.status(401).send(`
            <html>
            <body style="background:#0a0a0a;color:white;font-family:Montserrat,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
                <div style="text-align:center">
                    <h2 style="color:#ff5555;">Access Denied</h2>
                    <p style="color:#555;">You are not authorised to view this page.</p>
                    <a href="/login.html" style="color:#00b3ff;">Go to Login</a>
                </div>
            </body>
            </html>
        `);
    }

    res.redirect("/admin.html");
}
