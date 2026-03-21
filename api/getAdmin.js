import { readFileSync } from "fs";
import { join } from "path";

export default function handler(req, res) {
    const cookies = req.headers.cookie || "";
    const token = cookies.split(";").find(c => c.trim().startsWith("nca_token="))?.split("=")[1];

    if (token !== process.env.ADMIN_SECRET_TOKEN) {
        return res.redirect("/login.html");
    }

    const adminHtml = readFileSync(join(process.cwd(), "admin.html"), "utf8");
    const injected = adminHtml.replace(
        "<script>",
        `<script>sessionStorage.setItem("nca_token", "${process.env.ADMIN_SECRET_TOKEN}");\n`
    );

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(injected);
}
