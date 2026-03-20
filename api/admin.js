import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    "https://saigwnmokoiapfetxqtn.supabase.co",
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { action, payload } = req.body;

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
