import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    "https://saigwnmokoiapfetxqtn.supabase.co",
    process.env.SUPABASE_SERVICE_KEY
);

const PASSWORDS = [
    process.env.ADMIN_PASSWORD_1,
    process.env.ADMIN_PASSWORD_2
];

const SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN;

function validateToken(req) {
    const token = req.headers["x-admin-token"];
    return token === SECRET_TOKEN;
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { action, payload } = req.body;

    if (action === "login") {
        const { password } = payload;
        if (PASSWORDS.includes(password)) {
            return res.status(200).json({ success: true, token: SECRET_TOKEN });
        } else {
            return res.status(401).json({ error: "Invalid password" });
        }
    }

    if (!validateToken(req)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        switch (action) {

            case "deleteApplication": {
                const { error } = await supabase.from("applications").delete().eq("id", payload.id);
                if (error) return res.status(500).json({ error: error.message });
                return res.status(200).json({ success: true });
            }

            case "updateApplication": {
                const { error } = await supabase.from("applications").update(payload.data).eq("id", payload.id);
                if (error) return res.status(500).json({ error: error.message });
                return res.status(200).json({ success: true });
            }

            case "addOffender": {
                const { error } = await supabase.from("offenders").insert(payload);
                if (error) return res.status(500).json({ error: error.message });
                return res.status(200).json({ success: true });
            }

            case "deleteOffender": {
                const { error } = await supabase.from("offenders").delete().eq("id", payload.id);
                if (error) return res.status(500).json({ error: error.message });
                return res.status(200).json({ success: true });
            }

            case "addCase": {
                const { error } = await supabase.from("cases").insert(payload);
                if (error) return res.status(500).json({ error: error.message });
                return res.status(200).json({ success: true });
            }

            case "deleteCase": {
                const { error } = await supabase.from("cases").delete().eq("id", payload.id);
                if (error) return res.status(500).json({ error: error.message });
                return res.status(200).json({ success: true });
            }

            case "toggleWave": {
                const { data } = await supabase.from("settings").select("*").eq("key", "wave_status").single();
                const newStatus = data?.value === "open" ? "closed" : "open";
                if (data) {
                    await supabase.from("settings").update({ value: newStatus }).eq("key", "wave_status");
                } else {
                    await supabase.from("settings").insert({ key: "wave_status", value: newStatus });
                }
                return res.status(200).json({ success: true, status: newStatus });
            }

            default:
                return res.status(400).json({ error: "Unknown action" });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
