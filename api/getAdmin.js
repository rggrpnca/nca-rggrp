import { readFileSync } from "fs";
import { join } from "path";

export default function handler(req, res) {
    const cookies = req.headers.cookie || "";
    const cookieToken = cookies
        .split(";")
        .map(c => c.trim())
        .find(c => c.startsWith("nca_token="));

    const token = cookieToken ? cookieToken.split("=").slice(1).join("=").trim() : null;

    if (!token || token !== process.env.ADMIN_SECRET_TOKEN) {
        return res.redirect("/login.html");
    }

    const adminHtml = readFileSync(join(process.cwd(), "admin.html"), "utf8");
    const injected = adminHtml.replace(
        "<head>",
        `<head><script>sessionStorage.setItem("nca_token", "${process.env.ADMIN_SECRET_TOKEN}");</script>`
    );

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(injected);
}
